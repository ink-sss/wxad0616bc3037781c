import assert from 'node:assert/strict'
import test from 'node:test'

import { createQrMatrix } from '../src/utils/qrcode-matrix.js'

function expectAlignmentPattern(matrix, cx, cy) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const expected = Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      assert.equal(matrix[cy + dy][cx + dx], expected, `alignment pattern mismatch at ${cx + dx},${cy + dy}`)
    }
  }
}

test('createQrMatrix preserves version 7 alignment patterns on timing axes', () => {
  const matrix = createQrMatrix('x'.repeat(140))

  assert.equal(matrix.length, 45)
  expectAlignmentPattern(matrix, 22, 6)
  expectAlignmentPattern(matrix, 6, 22)
  expectAlignmentPattern(matrix, 22, 22)
  expectAlignmentPattern(matrix, 22, 38)
  expectAlignmentPattern(matrix, 38, 22)
  expectAlignmentPattern(matrix, 38, 38)
})
