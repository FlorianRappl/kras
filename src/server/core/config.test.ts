import { resolve } from 'path';
import { defaultConfig, buildConfiguration, makePathsAbsolute, mergeConfiguration } from './config';

describe('Configuration', () => {
  describe('buildConfiguration', () => {
    it('should work with an empty configuration and yield default configuration', () => {
      const config = buildConfiguration({});
      expect(config).toEqual(defaultConfig);
    });

    it('should work with an undefined configuration and yield default configuration', () => {
      const config = buildConfiguration();
      expect(config).toEqual(defaultConfig);
    });

    it('should work with a partial configuration by merging with the default one', () => {
      const config = buildConfiguration({
        name: 'foo',
        port: 1,
      });
      expect(config.name).toEqual('foo');
      expect(config.port).toEqual(1);
      expect(config.directory).toEqual(defaultConfig.directory);
      expect(config.injectors).toEqual(defaultConfig.injectors);
      expect(config.ssl).toEqual(defaultConfig.ssl);
    });
  });

  describe('makePathsAbsolute', () => {
    it('should change a relative directory entry', () => {
      const cwd = process.cwd();
      const config = {
        directory: 'foo',
      };
      makePathsAbsolute(cwd, config);
      expect(config).toEqual({
        directory: resolve(cwd, 'foo'),
      });
    });

    it('should not change an absolute directory entry', () => {
      const cwd = process.cwd();
      const directory = resolve(cwd, 'foo');
      const config = {
        directory,
      };
      makePathsAbsolute(cwd, config);
      expect(config).toEqual({
        directory,
      });
    });

    it('should change a relative client entry', () => {
      const cwd = process.cwd();
      const config = {
        client: '../bar',
      };
      makePathsAbsolute(cwd, config);
      expect(config).toEqual({
        client: resolve(cwd, '..', 'bar'),
      });
    });
  });

  describe('mergeConfiguration', () => {
    it('should work with no configuration and no options', () => {
      const config = mergeConfiguration({
        name: undefined,
        key: undefined,
        cert: undefined,
        dir: undefined,
        port: undefined,
      });
      expect(config).toEqual({});
    });

    it('should work with a single configuration and no options', () => {
      const config = mergeConfiguration(
        {
          name: undefined,
          key: undefined,
          cert: undefined,
          dir: undefined,
          port: undefined,
        },
        {
          name: 'foo',
          directory: 'bar',
        },
      );
      expect(config).toEqual({
        name: 'foo',
        directory: 'bar',
      });
    });

    it('should work with a single configuration and some options', () => {
      const config = mergeConfiguration(
        {
          name: 'Aff',
          key: undefined,
          cert: undefined,
          dir: 'Boo',
          port: undefined,
        },
        {
          name: 'foo',
          directory: 'bar',
        },
      );
      expect(config).toEqual({
        name: 'Aff',
        directory: 'Boo',
      });
    });
  });
});
