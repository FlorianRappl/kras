import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Page, Details } from '../components';
import { fullUrl } from '../utils';
import { config } from '../data';

export interface HomeProps extends RouteComponentProps<{}> {
  children?: React.ReactNode;
}

export const Home = ({}: HomeProps) => (
  <Page title="Overview" description="General overview and information.">
    <Details fields={[
      { label: 'Name', value: config.name },
      { label: 'Version', value: config.version }
    ]} />
  </Page>
);
