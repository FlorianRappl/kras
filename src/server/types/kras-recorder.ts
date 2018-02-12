import { KrasRequest } from './kras-request';
import { KrasAnswer } from './kras-injector';
import { EventEmitter } from 'events';

export interface RecordedRequest {
  id: string;
  start: Date;
  end: Date;
  request: KrasRequest;
  response: KrasAnswer;
}

export interface RecordedError {
  id: string;
  start: Date;
  end: Date;
  request: KrasRequest;
}

export interface RecordedMessage {
  id: string;
  time: Date;
  content: string;
  from: string;
  to: string;
}

export interface KrasRecorder extends EventEmitter {
  readonly requests: Array<RecordedRequest>;
  readonly errors: Array<RecordedError>;
  readonly messages: Array<RecordedMessage>;
}
