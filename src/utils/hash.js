// djb2 hash — deterministic, same inputs always produce same outputs
export function hash(str) {
  let h = 5381;
  const s = String(str == null ? '' : str);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Deterministic pick — seeded selection from an array
export function pick(seed, arr, count) {
  const items = arr.slice();
  const out = [];
  let h = seed >>> 0;
  for (let i = 0; i < count && items.length > 0; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const idx = h % items.length;
    out.push(items.splice(idx, 1)[0]);
  }
  return out;
}
