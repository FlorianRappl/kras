import { vi, it, describe, expect } from 'vitest';
import { Recorder } from './recorder';

describe('Recorder', () => {
  it('should not exceed given maximum length dropping from the front', () => {
    const recorder = new Recorder(2);
    const A: any = {};
    const B: any = {};
    const C: any = {};
    // @ts-ignore
    recorder.hit(new Date(), new Date(), A, undefined);
    // @ts-ignore
    recorder.hit(new Date(), new Date(), B, undefined);
    // @ts-ignore
    recorder.hit(new Date(), new Date(), C, undefined);
    expect(recorder.requests.length).toBe(2);
    expect(recorder.requests[0].request).toBe(B);
    expect(recorder.requests[1].request).toBe(C);
  });

  it('ignores request length for error book keeping', () => {
    const recorder = new Recorder(2);
    const A: any = {};
    const B: any = {};
    const C: any = {};
    // @ts-ignore
    recorder.hit(new Date(), new Date(), A, undefined);
    // @ts-ignore
    recorder.hit(new Date(), new Date(), B, undefined);
    recorder.miss(new Date(), new Date(), C);
    expect(recorder.requests.length).toBe(2);
    expect(recorder.errors.length).toBe(1);
    expect(recorder.requests[0].request).toBe(A);
    expect(recorder.requests[1].request).toBe(B);
  });

  it('should emit an event when storing the request', () => {
    const recorder = new Recorder(2);
    const A: any = {};
    let count = 0;

    recorder.addListener('recorded-request', (item) => {
      count = recorder.requests.length;
      expect(item.request).toBe(A);
    });
    // @ts-ignore
    recorder.hit(new Date(), new Date(), A, undefined);
    expect(count).toBe(1);
  });

  it('should emit an event when storing the miss', () => {
    const recorder = new Recorder(2);
    const A: any = {};
    let count = 0;

    recorder.addListener('recorded-miss', (item) => {
      count = recorder.errors.length;
      expect(item.request).toBe(A);
    });
    recorder.miss(new Date(), new Date(), A);
    expect(count).toBe(1);
  });

  it('should emit an event when storing the message', () => {
    const recorder = new Recorder(2);
    const A: any = { content: {} };
    let count = 0;

    recorder.addListener('recorded-message', (item) => {
      count = recorder.messages.length;
      expect(item.content).toBe(A.content);
    });
    recorder.message(new Date(), A);
    expect(count).toBe(1);
  });
});
