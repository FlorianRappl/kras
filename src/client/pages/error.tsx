import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Page, Loader, Protect, Details } from '../components';

export interface ErrorRouteParameters {
  id: string;
}

export interface ErrorProps extends RouteComponentProps<ErrorRouteParameters> {}

interface ErrorViewProps {
  data: {
    id: string;
    start: string;
    end: string;
    request: {
      url: string;
      target: string;
      query: {
        [name: string]: string;
      };
      method: string;
      headers: {
        [name: string]: string;
      };
      content: string;
    };
  };
}

const ErrorView: React.SFC<ErrorViewProps> = ({ data }) => (
  <Protect condition={!!data.id}>
    {!!data.id && (
      <Details
        fields={[
          { label: 'Request sent (date)', value: new Date(data.start).toDateString() },
          { label: 'Request sent (time)', value: new Date(data.start).toTimeString() },
          { label: 'Request failed (date)', value: new Date(data.end).toDateString() },
          { label: 'Request failed (time)', value: new Date(data.end).toTimeString() },
          {
            label: 'Duration (time)',
            value: `${(new Date(data.end).valueOf() - new Date(data.start).valueOf()) / 1000}s`,
          },
          { label: 'Target mapping', value: data.request.target },
          { label: 'HTTP URL', value: data.request.url },
          { label: 'HTTP method', value: data.request.method },
          { label: 'HTTP query parameters', value: data.request.query },
          { label: 'HTTP headers', value: data.request.headers },
          { label: 'HTTP body', value: data.request.content },
        ]}
      />
    )}
  </Protect>
);

export const Error: React.SFC<ErrorProps> = ({ match }) => (
  <Page title="Error" description="Details on the failed request.">
    <Loader url={`data/error/${match.params.id}`} component={ErrorView} />
  </Page>
);
