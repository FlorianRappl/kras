export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestData {
  url: string;
  body?: any;
  query?: string;
  method?: RequestMethod;
}

export function fullUrl(url: string, query?: string) {
  const path = location.origin + location.pathname + url;
  return query ? `${path}?${query}` : path;
}

export function request({ url, body, method = 'GET', query }: RequestData) {
  const expectResponse = method === 'GET';
  const address = fullUrl(url, query);
  return fetch(address, { body, method })
    .then(res => expectResponse && res.json());
}
