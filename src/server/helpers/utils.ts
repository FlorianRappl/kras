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
