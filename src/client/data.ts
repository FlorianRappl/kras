export interface BasicConfig {
  name: string;
  version: string;
}

export const config: BasicConfig = {
  name: 'kras',
  version: '',
};

export function withConfig<T>(newConfig: BasicConfig, app: T) {
  Object.assign(config, newConfig);
  return app;
}
