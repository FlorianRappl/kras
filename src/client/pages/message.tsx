import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Page, Loader, Protect, Details } from '../components';

export interface MessageRouteParameters {
  id: string;
}

export interface MessageProps extends RouteComponentProps<MessageRouteParameters> {}

interface MessageViewProps {
  data: {
    id: string;
    time: string;
    content: string;
    from: string;
    to: string;
  };
}

const MessageView: React.SFC<MessageViewProps> = ({ data }) => (
  <Protect condition={!!data.id}>
    {!!data.id && (
      <Details
        fields={[
          { label: 'Message sent (date)', value: new Date(data.time).toDateString() },
          { label: 'Message sent (time)', value: new Date(data.time).toTimeString() },
          { label: 'Message sender', value: data.from },
          { label: 'Message receiver', value: data.to },
          { label: 'Raw message content', value: data.content },
        ]}
      />
    )}
  </Protect>
);

export const Message: React.SFC<MessageProps> = ({ match }) => (
  <Page title="Message" description="Details on the message.">
    <Loader url={`data/message/${match.params.id}`} component={MessageView} />
  </Page>
);
