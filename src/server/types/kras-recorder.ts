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

export interface WebSocketMessage {
  content: string;
  from: string;
  to: string;
  remote: boolean;
}

export interface RecordedMessage extends WebSocketMessage {
  id: string;
  time: Date;
}

export interface KrasRecorder extends EventEmitter {
  readonly requests: Array<RecordedRequest>;
  readonly errors: Array<RecordedError>;
  readonly messages: Array<RecordedMessage>;
}
