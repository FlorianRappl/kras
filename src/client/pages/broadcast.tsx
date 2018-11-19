import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { FormGroup, FormText, Label, Button } from 'reactstrap';
import { Page } from '../components';
import { request } from '../utils';

export interface BroadcastProps extends RouteComponentProps<{}> {}

export interface BroadcastState {
  message: string;
}

export class Broadcast extends React.Component<BroadcastProps, BroadcastState> {
  constructor(props: BroadcastProps) {
    super(props);
    this.state = {
      message: '',
    };
  }

  private changeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      message: e.target.value,
    });
  };

  private sendMessage = () => {
    const { message } = this.state;

    request({
      url: 'broadcast',
      body: message,
      method: 'POST',
    });

    this.setState({
      message: '',
    });
  };

  render() {
    const { message } = this.state;
    return (
      <Page
        title="Broadcast"
        description="Sends a message to all connected WebSocket clients. Only available if the WebSocket feature is active.">
        <FormGroup>
          <Label>Message to connected clients:</Label>
          <textarea
            className="form-control"
            value={message}
            onChange={this.changeMessage}
            rows={10}
            style={{ resize: 'vertical' }}
          />
          <FormText>The message will be broadcasted to all connected clients as-is.</FormText>
        </FormGroup>
        <Button color="primary" onClick={this.sendMessage} disabled={!message}>
          Broadcast Message
        </Button>
      </Page>
    );
  }
}
