export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function containImage(width, height, naturalWidth, naturalHeight) {
  const ratio = Math.min(width / naturalWidth, height / naturalHeight);
  return { width: naturalWidth * ratio, height: naturalHeight * ratio };
}
export function maxImageZoom(naturalWidth, naturalHeight, width, height) {
  return Math.max(1, Math.min(3, naturalWidth / width, naturalHeight / height));
}
export function panBounds(x, y, scale, image, viewport) {
  const bx = Math.max(0, (image.width * scale - viewport.width) / 2);
  const by = Math.max(0, (image.height * scale - viewport.height) / 2);
  return { x: clamp(x, -bx, bx), y: clamp(y, -by, by) };
}
