export function filter(obj, ...keys) {
  return keys.reduce((a, c) => ({ ...a, [c]: obj[c] }), {});
}