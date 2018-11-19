import HarInjector from './har-injector';
import * as io from '../helpers/io';

jest.mock('../helpers/io', () => ({
  watch: jest.fn(),
}));

describe('HarInjector', () => {
  it('should be active when configured', () => {
    const injector = new HarInjector(
      {
        active: true,
      },
      {
        directory: '',
        map: {},
      },
    );
    expect(io.watch).toHaveBeenCalledTimes(1);
    expect(injector.active).toBeTruthy();
  });

  it('should not be active when turned off', () => {
    const injector = new HarInjector(
      {
        active: true,
      },
      {
        directory: '',
        map: {},
      },
    );
    injector.active = false;
    expect(injector.active).toBeFalsy();
  });

  it('should be active when turned on', () => {
    const injector = new HarInjector(
      {
        active: false,
      },
      {
        directory: '',
        map: {},
      },
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
