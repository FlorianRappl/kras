import { v4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  KrasRecorder,
  KrasRequest,
  KrasAnswer,
  RecordedRequest,
  RecordedError,
  RecordedMessage,
  WebSocketMessage,
} from '../types';

export class Recorder extends EventEmitter implements KrasRecorder {
  private readonly maximum: number;
  private enabled = true;
  readonly requests: Array<RecordedRequest> = [];
  readonly errors: Array<RecordedError> = [];
  readonly messages: Array<RecordedMessage> = [];

  constructor(maximum: number) {
    super();
    this.maximum = maximum;
  }

  disable() {
    this.enabled = false;
  }

  hit(start: Date, end: Date, request: KrasRequest, response: KrasAnswer) {
    if (this.enabled) {
      const requests = this.requests;
      const id = v4();
      const item = {
        id,
        start,
        end,
        request,
        response,
      };

      if (requests.length === this.maximum) {
        requests.shift();
      }

      this.requests.push(item);
      this.emit('recorded-request', item);
    }
  }

  message(time: Date, data: WebSocketMessage) {
    if (this.enabled) {
      const id = v4();
      const item = {
        id,
        time,
        ...data,
      };

      this.messages.push(item);
      this.emit('recorded-message', item);
    }
  }

  miss(start: Date, end: Date, request: KrasRequest) {
    if (this.enabled) {
      const id = v4();
      const item = {
        id,
        start,
        end,
        request,
      };

      this.errors.push(item);
      this.emit('recorded-miss', item);
    }
  }
}
