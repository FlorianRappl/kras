import { asJson, toFile } from './io';

function all<T>(_item: T) {
  return true;
}

function none<T>(_item: T) {
  return false;
}

export class JsonStore<T> {
  constructor(public file: string) {}

  insert(item: T) {
    const file = this.file;
    const items = asJson<Array<T>>(file, []);
    items.push(item);
    toFile(file, items);
  }

  delete(predicate?: (item: T) => boolean) {
    const file = this.file;
    const items = asJson<Array<T>>(file, undefined);

    if (items && items.length) {
      for (let i = items.length; i--; ) {
        if ((predicate || none)(items[i])) {
          items.splice(i, 1);
        }
      }

      toFile(file, items);
    }
  }

  select(predicate?: (item: T) => boolean) {
    const file = this.file;
    const items = asJson<Array<T>>(file, []);
    return items.filter(predicate || all);
  }

  switchTo(file: string) {
    this.file = file;
  }
}

export function open<T>(file: string) {
  return new JsonStore<T>(file);
}
