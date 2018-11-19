import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button } from 'reactstrap';
import { Page, Details } from '../components';
import { request } from '../utils';
import { config } from '../data';

export interface HomeProps extends RouteComponentProps<{}> {}

function restartServer() {
  request({
    url: 'config',
    body: JSON.stringify({
      mode: 'restart',
    }),
    method: 'PUT',
  });
}

function stopServer() {
  request({
    url: 'config',
    body: JSON.stringify({
      mode: 'stop',
    }),
    method: 'PUT',
  });
}

export const Home: React.SFC<HomeProps> = ({}) => (
  <Page title="Overview" description="General overview and information.">
    <Details
      fields={[
        { label: 'Name', value: config.name },
        { label: 'Version', value: config.version },
        { label: 'Started', value: config.started },
        { label: 'Base Directory', value: config.directory },
      ]}
    />
    <Button color="danger" onClick={restartServer}>
      Restart Server
    </Button>
    {' | '}
    <Button color="danger" onClick={stopServer}>
      Stop Server
    </Button>
  </Page>
);
