import * as React from 'react';
import { Router } from './router';
import { Layout, BasicConfig } from './layout';
import { Loader } from './components';

interface AppViewProps {
  data: BasicConfig;
  children?: React.ReactNode;
}

const AppView = ({ data }: AppViewProps) => (
  <Layout config={data}>
    <Router />
  </Layout>
);


export const App = () => (
  <Loader url="config" component={AppView} />
);
