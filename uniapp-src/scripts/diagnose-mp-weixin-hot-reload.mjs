#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const srcRoot = path.join(projectRoot, 'src')
const distRoot = path.join(projectRoot, 'dist', 'dev', 'mp-weixin')
const pagesJsonPath = path.join(srcRoot, 'pages.json')

const args = process.argv.slice(2)
const options = parseArgs(args)

const nativeTags = new Set([
  'ad',
  'block',
  'button',
  'canvas',
  'checkbox',
  'checkbox-group',
  'cover-image',
  'cover-view',
  'editor',
  'form',
  'functional-page-navigator',
  'icon',
  'image',
  'input',
  'label',
  'live-player',
  'live-pusher',
  'map',
  'match-media',
  'movable-area',
  'movable-view',
  'navigator',
  'official-account',
  'open-data',
  'page-container',
  'picker',
  'picker-view',
  'picker-view-column',
  'progress',
  'radio',
  'radio-group',
  'rich-text',
  'scroll-view',
  'slider',
  'swiper',
  'swiper-item',
  'switch',
  'text',
  'textarea',
  'video',
  'view',
  'web-view',
])

const pluginTags = new Set(['wechat-login'])
const wechatDevToolsProcessPattern = /wechatwebdevtools|wechatdevtools|wechat devtools|weixin devtools|微信开发者工具/i

function parseArgs(rawArgs) {
  const parsed = {
    json: false,
    snapshot: '',
    compare: '',
  }

  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i]
    if (arg === '--json') parsed.json = true
    else if (arg === '--snapshot') parsed.snapshot = rawArgs[++i] || ''
    else if (arg === '--compare') parsed.compare = rawArgs[++i] || ''
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return parsed
}

function printHelp() {
  console.log(`Usage:
  npm run diagnose:mp-weixin-hot-reload
  npm run diagnose:mp-weixin-hot-reload -- --snapshot .hot-reload-before.json
  npm run diagnose:mp-weixin-hot-reload -- --compare .hot-reload-before.json
  npm run diagnose:mp-weixin-hot-reload -- --json

The snapshot/compare flow measures how many files in dist/dev/mp-weixin changed
after one hot reload. Run --snapshot before saving a source file, save the file,
then run --compare with the same snapshot path.`)
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function normalizeRouteEntry(entry) {
  if (typeof entry === 'string') return { path: entry, style: {} }
  return { path: entry.path, style: entry.style || {} }
}

function routeStats() {
  const pagesJson = readJson(pagesJsonPath)
  const routes = []

  for (const page of pagesJson.pages || []) {
    const normalized = normalizeRouteEntry(page)
    routes.push({ ...normalized, kind: 'main' })
  }

  const subPackages = pagesJson.subPackages || pagesJson.subpackages || []
  for (const subPackage of subPackages) {
    const root = String(subPackage.root || '').replace(/\/$/, '')
    for (const page of subPackage.pages || []) {
      const normalized = normalizeRouteEntry(page)
      routes.push({
        ...normalized,
        kind: 'sub',
        root,
        path: `${root}/${normalized.path}`,
      })
    }
  }

  const missingSourceRoutes = routes.filter((route) => {
    return !fs.existsSync(path.join(srcRoot, `${route.path}.vue`))
  })

  const duplicatePaths = [...new Set(routes.map((route) => route.path))]
    .filter((routePath) => routes.filter((route) => route.path === routePath).length > 1)

  return {
    total: routes.length,
    main: (pagesJson.pages || []).length,
    sub: routes.length - (pagesJson.pages || []).length,
    subPackages: subPackages.length,
    componentRoutes: routes.filter((route) => route.path.startsWith('components/')),
    duplicatePaths,
    missingSourceRoutes,
  }
}

function easycomStats() {
  const pagesJson = readJson(pagesJsonPath)
  const easycom = pagesJson.easycom || {}
  const custom = easycom.custom || {}
  const customMatchers = Object.keys(custom).map((pattern) => ({
    pattern,
    target: custom[pattern],
    regex: new RegExp(pattern),
  }))
  const tagCoverage = collectTagCoverage(srcRoot, customMatchers)

  return {
    autoscan: easycom.autoscan !== false,
    customCount: Object.keys(custom).length,
    custom,
    usedHyphenatedTags: tagCoverage.usedTags.length,
    localComponentTags: tagCoverage.localComponentTags.length,
    unresolvedTags: tagCoverage.unresolvedTags,
  }
}

function collectTagCoverage(root, customMatchers) {
  const usedTags = new Set()
  const localComponentTags = new Set()
  const unresolved = new Map()

  for (const file of walkFiles(root, (entry) => entry.endsWith('.vue'))) {
    const source = fs.readFileSync(file, 'utf8')
    const sourceWithoutComments = source.replace(/<!--[\s\S]*?-->/g, '')
    const localTags = collectLocalComponentTags(source)

    for (const tag of localTags) localComponentTags.add(tag)

    for (const match of sourceWithoutComments.matchAll(/<([a-z][a-z0-9]*-[a-z0-9-]*)\b/g)) {
      const tag = match[1]
      usedTags.add(tag)

      if (
        nativeTags.has(tag) ||
        pluginTags.has(tag) ||
        localTags.has(tag) ||
        customMatchers.some((matcher) => matcher.regex.test(tag))
      ) {
        continue
      }

      const files = unresolved.get(tag) || []
      files.push(path.relative(projectRoot, file).replaceAll(path.sep, '/'))
      unresolved.set(tag, files)
    }
  }

  return {
    usedTags: [...usedTags].sort(),
    localComponentTags: [...localComponentTags].sort(),
    unresolvedTags: [...unresolved.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([tag, files]) => ({ tag, files })),
  }
}

function collectLocalComponentTags(source) {
  const tags = new Set()

  for (const match of source.matchAll(/import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+['"][^'"]+\.vue['"]/g)) {
    tags.add(pascalToKebab(match[1]))
  }

  for (const match of source.matchAll(/components\s*:\s*\{([\s\S]*?)\}/g)) {
    for (const name of match[1].matchAll(/\b([A-Za-z][A-Za-z0-9_]*)\b/g)) {
      tags.add(pascalToKebab(name[1]))
    }
    for (const name of match[1].matchAll(/['"]([a-z][a-z0-9]*-[a-z0-9-]*)['"]\s*:/g)) {
      tags.add(name[1])
    }
  }

  return tags
}

function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function distStats() {
  const files = fs.existsSync(distRoot)
    ? walkFiles(distRoot, () => true).map((file) => {
      const stat = fs.statSync(file)
      return {
        path: path.relative(distRoot, file).replaceAll(path.sep, '/'),
        size: stat.size,
        mtimeMs: Math.round(stat.mtimeMs),
      }
    })
    : []

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  const byExtension = {}
  for (const file of files) {
    const extension = path.extname(file.path) || '(none)'
    byExtension[extension] = (byExtension[extension] || 0) + 1
  }

  return {
    exists: fs.existsSync(distRoot),
    fileCount: files.length,
    totalBytes,
    sourcemapCount: files.filter((file) => file.path.endsWith('.map')).length,
    byExtension,
    largestFiles: [...files].sort((left, right) => right.size - left.size).slice(0, 15),
    files,
  }
}

function wechatDevToolsMemory() {
  try {
    const output = execFileSync('ps', ['-axo', 'pid=,rss=,command='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    const processes = output.split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(\d+)\s+(.+)$/)
        if (!match) return null
        return {
          pid: Number(match[1]),
          rssKb: Number(match[2]),
          command: match[3],
        }
      })
      .filter(Boolean)
      .filter((process) => wechatDevToolsProcessPattern.test(process.command))

    return {
      matched: processes.length,
      rssMb: Math.round(processes.reduce((sum, process) => sum + process.rssKb, 0) / 1024),
      processes: processes.map((process) => ({
        pid: process.pid,
        rssMb: Math.round(process.rssKb / 1024),
        command: process.command.slice(0, 180),
      })),
    }
  } catch {
    return {
      matched: 0,
      rssMb: 0,
      processes: [],
    }
  }
}

function walkFiles(root, filter) {
  const files = []
  if (!fs.existsSync(root)) return files
  const stack = [root]

  while (stack.length) {
    const current = stack.pop()
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) stack.push(fullPath)
      else if (entry.isFile() && filter(fullPath)) files.push(fullPath)
    }
  }

  return files.sort()
}

function collectReport() {
  const dist = distStats()
  return {
    generatedAt: new Date().toISOString(),
    projectRoot,
    routes: routeStats(),
    easycom: easycomStats(),
    dist: {
      exists: dist.exists,
      fileCount: dist.fileCount,
      totalBytes: dist.totalBytes,
      sourcemapCount: dist.sourcemapCount,
      byExtension: dist.byExtension,
      largestFiles: dist.largestFiles,
    },
    files: dist.files,
    wechatDevTools: wechatDevToolsMemory(),
  }
}

function compareFiles(beforeFiles, afterFiles) {
  const before = new Map(beforeFiles.map((file) => [file.path, file]))
  const after = new Map(afterFiles.map((file) => [file.path, file]))
  const added = []
  const removed = []
  const modified = []

  for (const [filePath, file] of after) {
    if (!before.has(filePath)) added.push(file)
    else {
      const oldFile = before.get(filePath)
      if (oldFile.size !== file.size || oldFile.mtimeMs !== file.mtimeMs) {
        modified.push(file)
      }
    }
  }

  for (const [filePath, file] of before) {
    if (!after.has(filePath)) removed.push(file)
  }

  return { added, removed, modified, changedCount: added.length + removed.length + modified.length }
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function printReport(report, comparison = null) {
  console.log('mp-weixin hot reload diagnostics')
  console.log(`generated: ${report.generatedAt}`)
  console.log(`project: ${report.projectRoot}`)
  console.log('')
  console.log('routes')
  console.log(`  total: ${report.routes.total} (${report.routes.main} main, ${report.routes.sub} sub, ${report.routes.subPackages} subpackages)`)
  console.log(`  component routes: ${report.routes.componentRoutes.length}`)
  console.log(`  missing .vue routes: ${report.routes.missingSourceRoutes.length}`)
  console.log(`  duplicate routes: ${report.routes.duplicatePaths.length}`)
  for (const route of report.routes.componentRoutes) console.log(`    component route: ${route.path}`)
  for (const route of report.routes.missingSourceRoutes) console.log(`    missing source: ${route.path}`)
  for (const routePath of report.routes.duplicatePaths) console.log(`    duplicate route: ${routePath}`)
  console.log('')
  console.log('easycom')
  console.log(`  autoscan: ${report.easycom.autoscan}`)
  console.log(`  explicit mappings: ${report.easycom.customCount}`)
  console.log(`  hyphenated tags seen: ${report.easycom.usedHyphenatedTags}`)
  console.log(`  local component tags seen: ${report.easycom.localComponentTags}`)
  console.log(`  tags not covered by easycom/native/plugin/local registration: ${report.easycom.unresolvedTags.length}`)
  if (report.easycom.unresolvedTags.length) {
    for (const unresolved of report.easycom.unresolvedTags) {
      console.log(`    ${unresolved.tag}: ${unresolved.files.join(', ')}`)
    }
  }
  console.log('')
  console.log('dist/dev/mp-weixin')
  console.log(`  exists: ${report.dist.exists}`)
  console.log(`  files: ${report.dist.fileCount}`)
  console.log(`  size: ${formatBytes(report.dist.totalBytes)}`)
  console.log(`  sourcemaps: ${report.dist.sourcemapCount}`)
  console.log(`  extensions: ${Object.entries(report.dist.byExtension).map(([ext, count]) => `${ext}:${count}`).join(', ') || '(none)'}`)
  console.log('  largest files:')
  for (const file of report.dist.largestFiles) {
    console.log(`    ${formatBytes(file.size).padStart(8)}  ${file.path}`)
  }
  console.log('')
  console.log('WeChat Developer Tools process memory')
  console.log(`  matched processes: ${report.wechatDevTools.matched}`)
  console.log(`  total RSS: ${report.wechatDevTools.rssMb} MB`)
  for (const process of report.wechatDevTools.processes) {
    console.log(`    ${process.rssMb.toString().padStart(6)} MB  pid=${process.pid}  ${process.command}`)
  }

  if (comparison) {
    console.log('')
    console.log('snapshot comparison')
    console.log(`  before: ${comparison.beforeGeneratedAt || '(unknown)'}`)
    console.log(`  changed files: ${comparison.changedCount}`)
    console.log(`  added: ${comparison.added.length}`)
    console.log(`  removed: ${comparison.removed.length}`)
    console.log(`  modified: ${comparison.modified.length}`)
    const topChanged = [...comparison.added, ...comparison.modified]
      .sort((left, right) => right.size - left.size)
      .slice(0, 20)
    if (topChanged.length) {
      console.log('  largest changed files:')
      for (const file of topChanged) {
        console.log(`    ${formatBytes(file.size).padStart(8)}  ${file.path}`)
      }
    }
  }
}

const report = collectReport()
let comparison = null

if (options.compare) {
  const before = readJson(path.resolve(projectRoot, options.compare))
  comparison = {
    beforeGeneratedAt: before.generatedAt,
    ...compareFiles(before.files || [], report.files || []),
  }
}

if (options.snapshot) {
  const snapshotPath = path.resolve(projectRoot, options.snapshot)
  fs.writeFileSync(snapshotPath, `${JSON.stringify(report, null, 2)}\n`)
  if (!options.json) console.log(`Wrote snapshot: ${snapshotPath}`)
}

if (options.json) {
  console.log(JSON.stringify({ ...report, comparison }, null, 2))
} else {
  printReport(report, comparison)
}
