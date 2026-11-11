import test from 'node:test';
import assert from 'node:assert/strict';
import { containImage, maxImageZoom, panBounds } from '../src/utilidades/imageZoom.js';

test('photographs retain portrait, landscape and square proportions', () => {
  assert.deepEqual(containImage(400, 400, 800, 1600), { width: 200, height: 400 });
  assert.deepEqual(containImage(400, 400, 1600, 800), { width: 400, height: 200 });
  assert.deepEqual(containImage(400, 400, 800, 800), { width: 400, height: 400 });
});
test('zoom respects native pixels and caps at three times', () => {
  assert.equal(maxImageZoom(200, 200, 400, 400), 1);
  assert.equal(maxImageZoom(800, 800, 400, 400), 2);
  assert.equal(maxImageZoom(2400, 2400, 400, 400), 3);
});
test('pan clamps to photograph edges and centers letterboxed axes', () => {
  assert.deepEqual(panBounds(900, -900, 2, { width: 200, height: 400 }, { width: 400, height: 400 }), { x: 0, y: -200 });
  assert.deepEqual(panBounds(90, 90, 1, { width: 400, height: 400 }, { width: 400, height: 400 }), { x: 0, y: 0 });
});
