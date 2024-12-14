import { describe, it, expect } from 'vitest';
import { fromHar, fromJson, fromNode, fromMissing } from './build-response';

describe('Build Response', () => {
  describe('fromHar', () => {
    it('is possible with an empty HAR response', () => {
      const result = fromHar('foo', {
        content: 'bar',
        headers: [],
      } as any);
      expect(result.url).toBe('foo');
    });
  });

  describe('fromJson', () => {
    it('transports status code', () => {
      const result = fromJson('foo', 200, 'Foo', {}, '');
      expect(result.url).toBe('foo');
      expect(result.status).toEqual({
        code: 200,
        text: 'Foo',
      });
    });

    it('works with content and has default status code', () => {
      const result = fromJson('http://google.com', undefined as any, undefined as any, {}, 'Foobar');
      expect(result.url).toBe('http://google.com');
      expect(result.status).toEqual({
        code: 200,
        text: '',
      });
      expect(result.content).toBe('Foobar');
    });
  });

  describe('fromNode', () => {
    it('is possible with empty node response', () => {
      const result = fromNode(
        {
          url: 'foo',
          headers: {},
        } as any,
        'Foo' as any,
      );
      expect(result.content).toBe('Foo');
      expect(result.url).toBe('foo');
      expect(result.status).toEqual({
        code: 200,
        text: '',
      });
    });

    it('is handling full node response', () => {
      const result = fromNode(
        {
          url: 'http://google.com',
          headers: {
            a: '5',
            b: 'c',
          },
          statusCode: 400,
        } as any,
        'Foo' as any,
      );
      expect(result.url).toBe('http://google.com');
      expect(result.content).toBe('Foo');
      expect(result.status).toEqual({
        code: 400,
        text: '',
      });
      expect(result.headers).toEqual({
        a: '5',
        b: 'c',
        'content-type': 'text/html',
      });
    });
  });

  describe('fromMissing', () => {
    it('is sufficient with a single URL', () => {
      const result = fromMissing('foo');
      expect(result.url).toBe('foo');
    });

    it('is passing through undefined URL to be empty', () => {
      const result = fromMissing(undefined as any);
      expect(result.url).toBe('');
    });
  });
});
