import * as React from 'react';
import { Alert } from 'reactstrap';
import { Spinner } from './spinner';
import { request, RequestMethod } from '../utils';

export interface LoadedProps<T> {
  data: T;
}

export interface LoaderState<T> {
  data: T | undefined;
  status: 'none' | 'loading' | 'success' | 'error';
  error: string | undefined;
}

export interface LoaderProps<T> {
  url: string;
  body?: any;
  method?: RequestMethod;
  query?: string;
  component: React.ComponentType<LoadedProps<T>>;
  forward?: any;
  onAuthError?(): void;
}

export class Loader<T> extends React.Component<LoaderProps<T>, LoaderState<T>> {
  private mounted = false;

  constructor(props: LoaderProps<T>) {
    super(props);
    this.state = {
      data: undefined,
      status: 'none',
      error: undefined,
    };
  }

  private resolve = (data: T) => {
    if (this.mounted) {
      this.setState({
        status: data ? 'success' : 'error',
        data,
      });
    }
  };

  private revoke = (err: Error) => {
    if (this.mounted) {
      this.setState({
        status: 'error',
        error: err && (err.message || err.toString()),
      });
    }
  };

  componentWillMount() {
    this.mounted = true;

    request(this.props)
      .then(this.resolve)
      .catch(this.revoke);

    this.setState({
      status: 'loading',
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { data, status, error } = this.state;
    const { component: Component, forward = {}, onAuthError } = this.props;

    switch (status) {
      case 'none':
        return false;
      case 'loading':
        return <Spinner />;
      case 'error':
        if (error === 'auth' && typeof onAuthError === 'function') {
          onAuthError();
          return false;
        }

        return <Alert color="danger">{error || 'Error while loading the data. Is the server still running?'}</Alert>;
      case 'success':
        return <Component {...forward} data={data} />;
    }
  }
}
