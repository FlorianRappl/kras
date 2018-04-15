import * as React from 'react';

export interface SpinnerProps {}

export const Spinner: React.SFC<SpinnerProps> = () => (
  <div className="spinner">
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
  </div>
);
