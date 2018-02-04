import * as React from 'react';
import { Recorder } from './recorder';

describe('Recorder', () => {
  it('should not exceed given maximum length dropping from the front', () => {
    const recorder = new Recorder(2);
    const A: any = {};
    const B: any = {};
    const C: any = {};
    recorder.hit(new Date(), new Date(), A, undefined);
    recorder.hit(new Date(), new Date(), B, undefined);
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
    recorder.hit(new Date(), new Date(), A, undefined);
    recorder.hit(new Date(), new Date(), B, undefined);
    recorder.miss(new Date(), new Date(), C);
    expect(recorder.requests.length).toBe(2);
    expect(recorder.errors.length).toBe(1);
    expect(recorder.requests[0].request).toBe(A);
    expect(recorder.requests[1].request).toBe(B);
  });
});
