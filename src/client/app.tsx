import * as React from 'react';
import { Router } from './router';
import { Layout } from './layout';
import { Loader, Login } from './components';
import { BasicConfig, withConfig } from './data';

interface AppViewProps {
  data: BasicConfig;
}

const AppView: React.SFC<AppViewProps> = ({ data }) =>
  withConfig(
    data,
    <Layout>
      <Router />
    </Layout>,
  );

export interface AppProps {}

export interface AppState {
  auth: boolean;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      auth: false,
    };
  }

  private authError = () => {
    this.setState({
      auth: true,
    });
  };

  private authSuccess = () => {
    this.setState({
      auth: false,
    });
  };

  render() {
    const { auth } = this.state;

    if (auth) {
      return <Login onSuccess={this.authSuccess} />;
    }

    return <Loader url="config" component={AppView} onAuthError={this.authError} />;
  }
}
