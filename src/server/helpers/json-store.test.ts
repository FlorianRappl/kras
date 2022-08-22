import { open } from './json-store';
import { asJson, toFile } from './io';

jest.mock('./io', () => ({
  asJson: jest.fn(),
  toFile: jest.fn(),
}));

describe('JsonStore', () => {
  it('select all without argument gets all items', () => {
    const store = open('foo');
    (asJson as jest.Mock<any, any>).mockImplementation(() => [1, 2, 3, 4]);
    const results = store.select();
    expect(results).toEqual([1, 2, 3, 4]);
  });

  it('select all with filter gets some items', () => {
    const store = open('foo');
    (asJson as jest.Mock<any, any>).mockImplementation(() => [1, 2, 3, 4]);
    const results = store.select((item: any) => item < 3);
    expect(results).toEqual([1, 2]);
  });

  it('switch to uses new file', () => {
    const store = open('foo');
    store.switchTo('bar');
    let result = '';
    (asJson as jest.Mock<any, any>).mockImplementation((name) => {
      result = name;
      return [];
    });
    store.select();
    expect(result).toEqual('bar');
  });

  it('insert changes the target', () => {
    const store = open('foo');
    let stored = undefined;
    (asJson as jest.Mock<any, any>).mockImplementation(() => [1, 2, 3, 4]);
    (toFile as jest.Mock<any, any>).mockImplementation((file, result) => {
      stored = result;
    });
    store.insert(5);
    expect(stored).toEqual([1, 2, 3, 4, 5]);
  });

  it('delete removes from the target if available', () => {
    const store = open('foo');
    let stored = undefined;
    (asJson as jest.Mock<any, any>).mockImplementation(() => [1, 2, 3, 4]);
    (toFile as jest.Mock<any, any>).mockImplementation((file, result) => {
      stored = result;
    });
    store.delete((item) => item === 4);
    expect(stored).toEqual([1, 2, 3]);
  });

  it('delete does not remove from the target if not available', () => {
    const store = open('foo');
    let stored = undefined;
    (asJson as jest.Mock<any, any>).mockImplementation(() => [1, 2, 3, 4]);
    (toFile as jest.Mock<any, any>).mockImplementation((file, result) => {
      stored = result;
    });
    store.delete((item) => item === 5);
    expect(stored).toEqual([1, 2, 3, 4]);
  });

  it('delete does not do anything if source is empty', () => {
    const store = open('foo');
    let stored = false;
    (asJson as jest.Mock<any, any>).mockImplementation(() => []);
    (toFile as jest.Mock<any, any>).mockImplementation((file, result) => {
      stored = true;
    });
    store.delete((item) => item === 5);
    expect(stored).toBe(false);
  });
});
