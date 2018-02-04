import * as React from 'react';
import { render } from 'react-dom';
import { App } from './app';
import 'bootstrap/dist/css/bootstrap.css';
import './app.css';

render(<App />, document.querySelector('#app'));
