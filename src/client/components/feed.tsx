import * as React from 'react';
import { feedUrl } from '../utils';

export interface FeedProps {
  feed: string;
  onMessage(msg: any): void;
}

export class Feed extends React.Component<FeedProps> {
  private ws: WebSocket;

  componentWillMount() {
    const { feed } = this.props;
    const url = feedUrl(feed);

    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = ev => {
        const { onMessage } = this.props;

        if (typeof onMessage === 'function') {
          onMessage(JSON.parse(ev.data));
        }
      };
    } catch (e) {
      console.error(
        `WebSocket connection cannot be established - make sure to activate WebSockets for receiving live updates.`,
      );
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
