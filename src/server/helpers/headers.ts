export interface ProxyRequestInfo {
  remoteAddress: string;
  port: string;
  encrypted: boolean;
  headers: Record<string, string | Array<string>>;
}

export function integrateXfwd(
  headers: Record<string, string | Array<string>>,
  protocol: string,
  req: ProxyRequestInfo,
) {
  const values: Record<string, string> = {
    for: req.remoteAddress,
    port: req.port,
    proto: req.encrypted ? `${protocol}s` : protocol,
  };

  Object.keys(values).forEach((key) => {
    const forwardKey = `x-forwarded-${key}`;
    const forward = headers[forwardKey] || '';
    const sep = forward ? ',' : '';
    headers[forwardKey] = forward + sep + values[key];
  });
}
