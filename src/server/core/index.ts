import { WebServer } from './webserver';
import { Recorder } from './recorder';
import { WebServerConfiguration, KrasRequest, KrasAnswer, WebSocketMessage } from '../types';

export class MockServerCore extends WebServer {
  readonly recorder = new Recorder(16 * 1024);

  constructor(config?: WebServerConfiguration) {
    super(config);

    for (const evt of ['message', 'broadcast']) {
      this.on(evt, (msg: WebSocketMessage) => {
        const time = new Date();
        this.recorder.message(time, msg);
      });
    }

    this.on('request', (req: KrasRequest) => {
      const start = new Date();
      const recordResponse = (res: KrasAnswer) => {
        const end = new Date();
        this.recorder.hit(start, end, req, res);
        this.removeListener('response', recordResponse);
        this.removeListener('missing', recordMissing);
      };
      const recordMissing = (res: KrasRequest) => {
        const end = new Date();
        this.recorder.miss(start, end, req);
        this.removeListener('response', recordResponse);
        this.removeListener('missing', recordMissing);
      };
      this.addListener('response', recordResponse);
      this.addListener('missing', recordMissing);
    });
  }
}
