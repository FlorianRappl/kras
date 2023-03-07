export function mapReverse<T, U>(items: Array<T>, select: (item: T, index: number, rindex: number) => U): Array<U> {
  const dest: Array<U> = [];

  for (let i = items.length, j = 0; i--; j++) {
    dest.push(select(items[i], i, j));
  }

  return dest;
}

export function filterReverse<T>(
  items: Array<T>,
  check: (item: T, index: number, rindex: number) => boolean,
): Array<T> {
  const dest: Array<T> = [];

  for (let i = items.length, j = 0; i--; j++) {
    const item = items[i];

    if (check(item, i, j)) {
      dest.push(item);
    }
  }

  return dest;
}

export function deepMerge(obj: any, value: any) {
  Object.keys(value).forEach((key) => {
    const oldItem = obj[key];
    const newItem = value[key];

    if (newItem === undefined) {
      delete obj[key];
    } else if (Array.isArray(oldItem) && Array.isArray(newItem)) {
      obj[key] = [...oldItem, ...newItem] as any;
    } else if (typeof oldItem === 'object') {
      obj[key] = deepMerge({ ...oldItem }, newItem);
    } else {
      obj[key] = newItem;
    }
  });

  return obj;
}

export function getLast(value: string | Array<string>) {
  if (Array.isArray(value)) {
    return value[value.length - 1];
  }

  return value;
}

export function getFirst(value: string | Array<string>) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
