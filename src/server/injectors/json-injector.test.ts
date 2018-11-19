import JsonInjector from './json-injector';
import * as io from '../helpers/io';

jest.mock('../helpers/io', () => ({
  watch: jest.fn(),
}));

describe('JsonInjector', () => {
  it('should be active when configured', () => {
    const injector = new JsonInjector(
      {
        active: true,
      },
      {
        directory: '',
      },
    );
    expect(io.watch).toHaveBeenCalledTimes(1);
    expect(injector.active).toBeTruthy();
  });

  it('should not be active when turned off', () => {
    const injector = new JsonInjector(
      {
        active: true,
      },
      {
        directory: '',
      },
    );
    injector.active = false;
    expect(injector.active).toBeFalsy();
  });

  it('should be active when turned on', () => {
    const injector = new JsonInjector(
      {
        active: false,
      },
      {
        directory: '',
      },
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
