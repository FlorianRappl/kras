import { KrasAnswer } from './kras-injector';
import { Headers } from './kras-basics';

export interface ScriptResponseBuilderData {
  statusCode?: number;
  statusText?: string;
  headers?: Headers;
  content?: string;
}

export interface ScriptResponseBuilder {
  (data: ScriptResponseBuilderData): KrasAnswer;
}
