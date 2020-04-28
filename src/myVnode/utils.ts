export function isObejct(obj: any): boolean {
  if (!obj) {
    return false;
  }

  return Object.prototype.toString.call(obj) === "[object Object]";
}
