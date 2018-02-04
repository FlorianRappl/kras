import * as React from 'react';
import { Alert } from 'reactstrap';
import { Spinner } from './spinner';
import { request, RequestMethod } from '../utils';

export interface LoadedProps<T> {
  data: T;
}

export interface LoaderState<T> {
  data: T | undefined;
  status: 'none' | 'loading' | 'loaded';
  error: string | undefined;
}

export interface LoaderProps<T> {
  url: string;
  body?: any;
  method?: RequestMethod;
  query?: string;
  component: React.ComponentType<LoadedProps<T>>;
  children?: void;
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
        status: 'loaded',
        data,
      });
    }
  };

  private revoke = (error: string) => {
    if (this.mounted) {
      this.setState({
        status: 'loaded',
        error,
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
    const { component: Component } = this.props;

    switch (status) {
      case 'none':
        return false;
      case 'loading':
        return <Spinner />;
      case 'loaded':
        return data && !error ? <Component data={data} /> : (
          <Alert color="danger">
            {error}
          </Alert>
        );
    }
  }
}
