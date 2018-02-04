import * as React from 'react';

export interface SpinnerProps {
  children?: void;
}

export const Spinner = () => (
  <div className="spinner">
    <div className="bounce1" />
    <div className="bounce2" />
    <div className="bounce3" />
  </div>
);
