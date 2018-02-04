import { KrasRequest } from './kras-request';
import { KrasAnswer } from './kras-injector';

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
}

export interface KrasRecorder {
  readonly requests: Array<RecordedRequest>;
  readonly errors: Array<RecordedError>;
  readonly messages: Array<RecordedMessage>;
}
