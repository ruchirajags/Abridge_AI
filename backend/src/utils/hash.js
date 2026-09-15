// Deterministic 32-bit hash (FNV-1a) from a string.
export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Deterministic seeded pick: choose n items from a pool.
export function pick(seed, pool, n) {
  const arr = [...pool];
  const out = [];
  let s = seed >>> 0;
  while (out.length < n && arr.length) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const i = s % arr.length;
    out.push(arr.splice(i, 1)[0]);
  }
  return out;
}