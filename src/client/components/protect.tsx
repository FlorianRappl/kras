import * as React from 'react';
import { Redirect } from 'react-router-dom';

export interface ProtectProps {
  condition: boolean;
  children?: React.ReactNode;
}

export const Protect = ({ condition, children }: ProtectProps) => (
  <div>
    {!condition ? <Redirect to="/" /> : children}
  </div>
);
