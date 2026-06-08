import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { minify as minifyJsSource } from 'terser'

const outputDir = fileURLToPath(new URL('../dist/build/mp-weixin/', import.meta.url))

function stripCssComments(source) {
  let output = ''
  let quote = ''
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (quote) {
      output += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      output += char
      continue
    }

    if (char === '/' && next === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        index += 1
      }
      index += 1
      continue
    }

    output += char
  }

  return output
}

function canOmitSpace(previous, next, { insideCalc = false } = {}) {
  if (!previous) return true
  if (insideCalc && ('+-'.includes(previous) || '+-'.includes(next))) return false
  if ('{}:;,>)'.includes(next)) return true
  if ('{}:;,(>'.includes(previous)) return true
  if ('+~'.includes(previous) || '+~'.includes(next)) return true
  return false
}

function getTrailingIdentifier(source) {
  const match = source.match(/[-_a-zA-Z0-9]+$/)
  return match ? match[0].toLowerCase() : ''
}

function minifyWxss(source) {
  const sourceWithoutComments = stripCssComments(source)
  let output = ''
  let quote = ''
  let escaped = false
  let pendingSpace = false
  let parenDepth = 0
  const calcDepths = []

  for (const char of sourceWithoutComments) {
    if (quote) {
      output += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = ''
      }
      continue
    }

    if (char === '"' || char === "'") {
      if (pendingSpace && !canOmitSpace(output[output.length - 1], char, { insideCalc: calcDepths.length > 0 })) output += ' '
      pendingSpace = false
      quote = char
      output += char
      continue
    }

    if (/\s/.test(char)) {
      pendingSpace = true
      continue
    }

    if (pendingSpace && !canOmitSpace(output[output.length - 1], char, { insideCalc: calcDepths.length > 0 })) output += ' '
    pendingSpace = false

    if (char === '(') {
      const startsCalc = getTrailingIdentifier(output) === 'calc'
      output += char
      parenDepth += 1
      if (startsCalc) calcDepths.push(parenDepth)
      continue
    }

    if (char === ')') {
      output += char
      if (calcDepths[calcDepths.length - 1] === parenDepth) calcDepths.pop()
      parenDepth = Math.max(0, parenDepth - 1)
      continue
    }

    output += char
  }

  return output.trim().replace(/;}/g, '}')
}

function stripWxmlComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, '')
}

function minifyWxml(source) {
  return stripWxmlComments(source)
    .replace(/>\s+</g, '><')
    .trim()
}

function minifyJson(source) {
  return JSON.stringify(JSON.parse(source))
}

async function collectOutputFiles(directory) {
  const entries = await readdir(directory)
  const files = {
    js: [],
    wxss: [],
    wxml: [],
    json: [],
    removable: [],
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry)
    const info = await stat(absolutePath)
    if (info.isDirectory()) {
      const childFiles = await collectOutputFiles(absolutePath)
      files.js.push(...childFiles.js)
      files.wxss.push(...childFiles.wxss)
      files.wxml.push(...childFiles.wxml)
      files.json.push(...childFiles.json)
      files.removable.push(...childFiles.removable)
    } else if (entry.endsWith('.js')) {
      files.js.push(absolutePath)
    } else if (entry.endsWith('.wxss')) {
      files.wxss.push(absolutePath)
    } else if (entry.endsWith('.wxml')) {
      files.wxml.push(absolutePath)
    } else if (entry.endsWith('.json')) {
      files.json.push(absolutePath)
    } else if (entry.endsWith('.map') || entry.endsWith('.scss')) {
      files.removable.push(absolutePath)
    }
  }

  return files
}

async function minifyFiles(files, minify) {
  let before = 0
  let after = 0
  let changed = 0

  await Promise.all(files.map(async (file) => {
    const source = await readFile(file, 'utf8')
    const minified = await minify(source)
    before += Buffer.byteLength(source)
    after += Buffer.byteLength(minified)
    if (source !== minified) {
      changed += 1
      await writeFile(file, minified)
    }
  }))

  return {
    total: files.length,
    changed,
    before,
    after,
    saved: before - after,
  }
}

async function minifyJsFiles(files) {
  return minifyFiles(files, async (source) => {
    const result = await minifyJsSource(source, {
      compress: {
        passes: 2,
        drop_console: true,
        drop_debugger: true,
      },
      ecma: 2015,
      format: {
        comments: false,
      },
      mangle: true,
      sourceMap: false,
      toplevel: false,
    })

    if (!result.code) throw new Error('Terser returned empty output')
    return result.code
  })
}

async function removeFiles(files) {
  let removedBytes = 0

  await Promise.all(files.map(async (file) => {
    const info = await stat(file)
    removedBytes += info.size
    await rm(file)
  }))

  return {
    total: files.length,
    removedBytes,
  }
}

function printSummary(label, result) {
  console.log(`${label}: files=${result.total}, changed=${result.changed}, raw=${result.before} bytes, minified=${result.after} bytes, saved=${result.saved} bytes`)
}

async function main() {
  const files = await collectOutputFiles(outputDir)
  const [js, wxss, wxml, json, removable] = await Promise.all([
    minifyJsFiles(files.js),
    minifyFiles(files.wxss, minifyWxss),
    minifyFiles(files.wxml, minifyWxml),
    minifyFiles(files.json, minifyJson),
    removeFiles(files.removable),
  ])

  printSummary('JS', js)
  printSummary('WXSS', wxss)
  printSummary('WXML', wxml)
  printSummary('JSON', json)
  console.log(`Removed non-runtime files: files=${removable.total}, saved=${removable.removedBytes} bytes`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
