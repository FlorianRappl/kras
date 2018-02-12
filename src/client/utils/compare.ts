export function areDifferent<T>(a: Array<T>, b: Array<T>) {
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return true;
      }
    }

    return false;
  }

  return true;
}
