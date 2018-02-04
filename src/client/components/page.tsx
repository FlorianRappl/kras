import * as React from 'react';

export interface PageProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const Page = ({ title, children, description }: PageProps) => (
  <div>
    <h1 className="display-3">{title}</h1>
    {description && <p className="lead">{description}</p>}
    {children}
  </div>
);
