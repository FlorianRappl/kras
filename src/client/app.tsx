import * as React from 'react';
import { Router } from './router';
import { Layout } from './layout';
import { Loader } from './components';
import { BasicConfig, withConfig } from './data';

interface AppViewProps {
  data: BasicConfig;
  children?: React.ReactNode;
}

const AppView = ({ data }: AppViewProps) => withConfig(data, (
  <Layout>
    <Router />
  </Layout>
));


export const App = () => (
  <Loader url="config" component={AppView} />
);
