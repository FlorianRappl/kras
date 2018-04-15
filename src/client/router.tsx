import * as React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { Home, Requests, Broadcast, Settings, Injectors, Error, Message, Request, Editor, Logs } from './pages';

export interface RouterProps {}

export const Router: React.SFC<RouterProps> = () => (
  <HashRouter>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/requests/:tab?" component={Requests} />
      <Route exact path="/requests/request/:id" component={Request} />
      <Route exact path="/requests/message/:id" component={Message} />
      <Route exact path="/requests/error/:id" component={Error} />
      <Route exact path="/broadcast" component={Broadcast} />
      <Route exact path="/settings" component={Settings} />
      <Route exact path="/injectors/:injector?" component={Injectors} />
      <Route exact path="/logs" component={Logs} />
      <Route exact path="/editor/:file" component={Editor} />
    </Switch>
  </HashRouter>
);
