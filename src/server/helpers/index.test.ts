import { mapReverse, filterReverse } from './index';

describe('Helpers', () => {
  it('mapReverse should work with an empty array', () => {
    const result = mapReverse([], (item) => item);
    expect(result).toEqual([]);
  });

  it('mapReverse should work with identity selector', () => {
    const result = mapReverse([1, 2, 3, 4, 5], (item) => item);
    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('mapReverse should work with any selector', () => {
    const result = mapReverse([1, 2, 3, 4, 5], (item) => item * item);
    expect(result).toEqual([25, 16, 9, 4, 1]);
  });

  it('mapReverse should use ordinary index', () => {
    const result = mapReverse([1, 2, 3, 4, 5], (item, index) => index);
    expect(result).toEqual([4, 3, 2, 1, 0]);
  });

  it('mapReverse should use provide reverse index', () => {
    const result = mapReverse([1, 2, 3, 4, 5], (item, _, index) => index);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  it('filterReverse should work with an empty array', () => {
    const result = filterReverse([], (item) => false);
    expect(result).toEqual([]);
  });

  it('filterReverse should work with false selector', () => {
    const result = filterReverse([1, 2, 3, 4, 5], (item) => false);
    expect(result).toEqual([]);
  });

  it('filterReverse should work with true selector', () => {
    const result = filterReverse([1, 2, 3, 4, 5], (item) => true);
    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('filterReverse should work with custom selector', () => {
    const result = filterReverse([1, 2, 3, 4, 5], (item) => item % 2 === 1);
    expect(result).toEqual([5, 3, 1]);
  });

  it('filterReverse should use ordinary index', () => {
    const result = filterReverse([1, 2, 3, 4, 5], (item, index) => index !== 0);
    expect(result).toEqual([5, 4, 3, 2]);
  });

  it('filterReverse should provide reverse index', () => {
    const result = filterReverse([1, 2, 3, 4, 5], (item, _, index) => index !== 0);
    expect(result).toEqual([4, 3, 2, 1]);
  });
});
