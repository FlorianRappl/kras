import * as React from 'react';
import { fullUrl } from '../utils';

export interface FeedProps {
  feed: string;
  onMessage(msg: any): void;
  children?: React.ReactNode;
}

export class Feed extends React.Component<FeedProps> {
  private ws: WebSocket;

  componentWillMount() {
    const { feed } = this.props;
    const url = `ws${fullUrl(feed).substr(4)}`;

    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = (ev) => {
        const { onMessage } = this.props;

        if (typeof onMessage === 'function') {
          onMessage(JSON.parse(ev.data));
        }
      };
    } catch (e) {
      console.error(`WebSocket connection cannot be established - make sure to activate WebSockets for receiving live updates.`);
    }
  }

  componentWillUnmount() {
    this.ws.close();
  }

  render() {
    const { children } = this.props;
    return children || false;
  }
}
