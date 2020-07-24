import { KrasRequestQuery, KrasRequest } from '../types';

function queryEquals(a: KrasRequestQuery, b: KrasRequestQuery) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);

  if (ak.length <= bk.length) {
    for (const n of ak) {
      if (a[n] !== b[n]) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function stringEquals(a: string, b: string) {
  return a.length === b.length && a.toUpperCase() === b.toUpperCase();
}

function pathEquals(a: string, b: string) {
  const ai = a.indexOf('?');
  const bi = b.indexOf('?');
  if (ai !== -1) {
    a = a.substr(0, ai);
  }
  if (bi !== -1) {
    b = b.substr(0, bi);
  }

  return stringEquals(a, b);
}

export function compareRequests(a: KrasRequest, b: KrasRequest) {
  return (
    a.method === b.method &&
    (!a.target || !b.target || a.target === b.target) &&
    pathEquals(a.url, b.url) &&
    queryEquals(a.query, b.query)
  );
}
