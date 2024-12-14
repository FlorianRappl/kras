import { vi, it, describe, expect } from 'vitest';
import HarInjector from './har-injector';
import * as io from '../helpers/io';

vi.mock('../helpers/io', () => ({
  watch: vi.fn(),
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
      } as any,
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
      } as any,
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
      } as any,
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
