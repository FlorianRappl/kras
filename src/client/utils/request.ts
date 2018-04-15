export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestData {
  url: string;
  body?: string;
  query?: string;
  method?: RequestMethod;
  response?: boolean;
}

export function fullUrl(url: string, query?: string) {
  const path = location.origin + location.pathname + url;
  return query ? `${path}?${query}` : path;
}

let middleware: ((req: RequestInit) => void) = undefined;

function isAuth(res: Response) {
  return res.status !== 401 && res.status !== 403;
}

export function setMiddleware(fn: (req: RequestInit) => void) {
  middleware = fn;
}

export function request({ url, body, method = 'GET', query, response = false }: RequestData) {
  const expectResponse = response || method === 'GET';
  const address = fullUrl(url, query);
  const opts: RequestInit = { body, method };

  if (typeof middleware === 'function') {
    middleware(opts);
  }

  return fetch(address, opts)
    .then(res => isAuth(res) ? expectResponse && res.json() : Promise.reject('auth'));
}
