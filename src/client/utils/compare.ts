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

function areEqualDeep(a: any, b: any) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);

  if (!areDifferent(ka, kb)) {
    for (const key of ka) {
      if (!areEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function areEqual<T>(a: T, b: T) {
  if (a !== b) {
    if (Array.isArray(a) && Array.isArray(b) && !areDifferent<any>(a, b)) {
      return true;
    } else if (typeof a === 'object' && typeof b === 'object' && areEqualDeep(a, b)) {
      return true;
    }

    return false;
  }

  return true;
}
