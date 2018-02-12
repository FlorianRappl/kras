export interface BasicConfig {
  name: string;
  version: string;
  directory: string;
}

export const config: BasicConfig = {
  name: 'kras',
  version: '',
  directory: '(none)',
};

export function withConfig<T>(newConfig: BasicConfig, app: T) {
  Object.assign(config, newConfig);
  return app;
}
