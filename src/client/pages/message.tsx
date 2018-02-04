import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Page, Loader, Protect, Details } from '../components';

export interface MessageRouteParameters {
  id: string;
}

export interface MessageProps extends RouteComponentProps<MessageRouteParameters> {
  children?: React.ReactNode;
}

interface MessageViewProps {
  data: {
    id: string;
    time: string;
    content: string;
  };
  children?: React.ReactNode;
}

const MessageView = ({ data }: MessageViewProps) => (
  <Protect condition={!!data.id}>
    {
      !!data.id && <Details fields={[
        { label: 'Message sent (date)', value: new Date(data.time).toDateString() },
        { label: 'Message sent (time)', value: new Date(data.time).toTimeString() },
        { label: 'Raw message content', value: data.content },
      ]} />
    }
  </Protect>
);

export const Message = ({ match }: MessageProps) => (
  <Page title="Message" description="Details on the message.">
    <Loader url={`data/message/${match.params.id}`} component={MessageView} />
  </Page>
);
