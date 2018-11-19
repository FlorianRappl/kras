import * as React from 'react';
import { Redirect } from 'react-router-dom';

export interface ProtectProps {
  condition: boolean;
}

export const Protect: React.SFC<ProtectProps> = ({ condition, children }) => (
  <div>{!condition ? <Redirect to="/" /> : children}</div>
);
