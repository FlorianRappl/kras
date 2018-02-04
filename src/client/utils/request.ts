export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestData {
  url: string;
  body?: any;
  query?: string;
  method?: RequestMethod;
}

export function request({ url, body, method = 'GET', query }: RequestData) {
  const path = location.origin + location.pathname + url;
  const expectResponse = method === 'GET';
  const address = query ? `${url}?${query}` : url;
  return fetch(address, { body, method })
    .then(res => expectResponse && res.json());
}
