import * as React from 'react';
import { Button, Alert, Input } from 'reactstrap';
import { setAuthToken, request } from '../utils';

export interface LoginProps {
  onSuccess?(): void;
}

export interface LoginState {
  submit: boolean;
  username: string;
  password: string;
  error: string;
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      submit: false,
      username: '',
      password: '',
      error: '',
    };
  }

  private submit = (e: React.FormEvent<HTMLFormElement>) => {
    const { username, password } = this.state;

    request({
      url: 'login',
      method: 'POST',
      response: true,
      body: JSON.stringify({
        username,
        password,
      }),
    }).then(
      res => this.authorized(res.token),
      err =>
        this.setState({
          error: err,
          submit: false,
        }),
    );

    e.preventDefault();
    return false;
  };

  private authorized(token: string) {
    const { onSuccess } = this.props;
    setAuthToken(token);

    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  }

  private changeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      username: e.target.value,
    });
  };

  private changePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value,
    });
  };

  render() {
    const { submit, username, password, error } = this.state;

    return (
      <div className="login">
        <form onSubmit={this.submit}>
          <h1 className="display-4">Login</h1>
          <p>
            <Input type="text" value={username} onChange={this.changeUserName} placeholder="Username" />
          </p>
          <p>
            <Input type="password" value={password} onChange={this.changePassword} placeholder="Password" />
          </p>
          <p>
            <Button color="primary" type="submit" disabled={submit}>
              Submit
            </Button>
          </p>
          {error && <Alert color="danger">Error while logging in.</Alert>}
        </form>
      </div>
    );
  }
}
