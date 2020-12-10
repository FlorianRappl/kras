import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Page, Loader, Protect, Details } from '../components';

export interface RequestRouteParameters {
  id: string;
}

export interface RequestProps extends RouteComponentProps<RequestRouteParameters> {}

interface RequestViewProps {
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
    response: {
      headers: {
        [name: string]: string;
      };
      status: {
        code: number;
        text: string;
      };
      url: string;
      redirectUrl: string;
      content: string;
      injector?: {
        name: string;
      };
    };
  };
}

function getString(content: string | { type: 'Buffer'; data: Array<number> }) {
  if (typeof content !== 'string') {
    switch (content.type) {
      case 'Buffer':
        if (typeof Uint16Array !== 'undefined') {
          // tslint:disable-next-line
          return String.fromCharCode.apply(null, new Uint16Array(content.data));
        }
      default:
        return '';
    }
  }

  return content;
}

const RequestView: React.SFC<RequestViewProps> = ({ data }) => (
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
          { label: 'Responsible injector', value: data.response.injector.name },
          { label: 'HTTP request URL', value: data.request.url },
          { label: 'HTTP request method', value: data.request.method },
          { label: 'HTTP request query parameters', value: data.request.query },
          { label: 'HTTP request headers', value: data.request.headers },
          { label: 'HTTP request body', value: data.request.content },
          { label: 'HTTP response URL', value: data.response.url },
          { label: 'HTTP response redirect URL', value: data.response.redirectUrl },
          { label: 'HTTP response headers', value: data.response.headers },
          { label: 'HTTP response status', value: `${data.response.status.code} ${data.response.status.text}` },
          { label: 'HTTP response body', value: getString(data.response.content) },
        ]}
      />
    )}
  </Protect>
);

export const Request: React.SFC<RequestProps> = ({ match }) => (
  <Page title="Request" description="Details on the succeeded request.">
    <Loader url={`data/request/${match.params.id}`} component={RequestView} />
  </Page>
);
