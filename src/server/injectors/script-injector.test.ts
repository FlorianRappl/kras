import ScriptInjector from './script-injector';
import * as io from '../helpers/io';
import { EventEmitter } from 'events';

jest.mock('../helpers/io', () => ({
  watch: jest.fn(),
}));

describe('ScriptInjector', () => {
  it('should be active when configured', () => {
    const evt = new EventEmitter();
    const injector = new ScriptInjector(
      {
        active: true,
      },
      {
        directory: '',
      } as any,
      evt,
    );
    expect(io.watch).toHaveBeenCalledTimes(1);
    expect(injector.active).toBeTruthy();
  });

  it('should not be active when turned off', () => {
    const evt = new EventEmitter();
    const injector = new ScriptInjector(
      {
        active: true,
      },
      {
        directory: '',
      } as any,
      evt,
    );
    injector.active = false;
    expect(injector.active).toBeFalsy();
  });

  it('should be active when turned on', () => {
    const evt = new EventEmitter();
    const injector = new ScriptInjector(
      {
        active: false,
      },
      {
        directory: '',
      } as any,
      evt,
    );
    injector.active = true;
    expect(injector.active).toBeTruthy();
  });
});
