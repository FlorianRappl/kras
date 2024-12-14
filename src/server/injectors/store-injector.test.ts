import { vi, it, describe, expect } from 'vitest';
import StoreInjector from './store-injector';
import * as jsonStore from '../helpers/json-store';

vi.mock('../helpers/json-store', () => ({
  open: vi.fn(),
}));

describe('StoreInjector', () => {
  it('should be active when configured', () => {
    const injector = new StoreInjector(
      {
        active: true,
      },
      {
        directory: '',
      } as any,
    );
    expect(jsonStore.open).toHaveBeenCalledTimes(1);
    expect(injector.active).toBeTruthy();
  });

  it('should not be active when turned off', () => {
    const injector = new StoreInjector(
      {
        active: true,
      },
      {
        directory: '',
      } as any,
    );
    injector.active = false;
    expect(injector.active).toBeFalsy();
  });

  it('should be active when turned on', () => {
    const injector = new StoreInjector(
      {
        active: false,
      },
      {
        directory: '',
      } as any,
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
