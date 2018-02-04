import * as uuid from 'uuid/v4';
import { KrasRecorder, KrasRequest, KrasAnswer, RecordedRequest, RecordedError, RecordedMessage } from '../types';

export class Recorder implements KrasRecorder {
  private readonly maximum: number;
  readonly requests: Array<RecordedRequest> = [];
  readonly errors: Array<RecordedError> = [];
  readonly messages: Array<RecordedMessage> = [];

  constructor(maximum: number) {
    this.maximum = maximum;
  }

  hit(start: Date, end: Date, request: KrasRequest, response: KrasAnswer) {
    const requests = this.requests;
    const id = uuid();

    if (requests.length === this.maximum) {
      requests.shift();
    }

    this.requests.push({
      id,
      start,
      end,
      request,
      response,
    });
  }

  message(time: Date, content: string) {
    const id = uuid();

    this.messages.push({
      id,
      time,
      content,
    });
  }

  miss(start: Date, end: Date, request: KrasRequest) {
    const id = uuid();

    this.errors.push({
      id,
      start,
      end,
      request,
    });
  }
}
