import { KrasRequestQuery, BasicKrasRequest } from '../types';

function queryEquals(a: KrasRequestQuery, b: KrasRequestQuery) {
  const ak = Object.keys(a);
  const bk = Object.keys(b);

  if (ak.length === bk.length) {
    for (const n of ak) {
      if ((a[n] !== b[n] && a[n] !== '*') || typeof b[n] === 'undefined') {
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
  const i = a.indexOf('?');

  if (i === b.indexOf('?')) {
    if (i !== -1) {
      a = a.substr(0, i);
      b = b.substr(0, i);
    }

    return stringEquals(a, b);
  }

  return false;
}

function serializedUrl(a: BasicKrasRequest) {
  const queryString = Object.keys(a.query)
    .reduce((keys, k) => {
      keys.push(`${k}=${a.query[k]}`);
      return keys;
    }, [])
    .join('&');
  return (a.method.toLowerCase() === 'get' || a.method.toLowerCase() === 'post') && queryString
    ? `${a.url}?${queryString}`
    : a.url;
}

export function compareRequests(a: BasicKrasRequest, b: BasicKrasRequest) {
  return (
    a.method === b.method &&
    (!a.target || !b.target || a.target === b.target) &&
    pathEquals(serializedUrl(a), b.url) &&
    queryEquals(a.query, b.query)
  );
}
