import StoreInjector from './store-injector';
import * as jsonStore from '../helpers/json-store';

jest.mock('../helpers/json-store', () => ({
  open: jest.fn(),
}));

describe('StoreInjector', () => {
  it('should be active when configured', () => {
    const injector = new StoreInjector(
      {
        active: true,
      },
      {
        directory: '',
      },
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
      },
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
      },
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
