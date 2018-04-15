import * as React from 'react';

export interface PageProps {
  title: string;
  description?: string;
}

export const Page: React.SFC<PageProps> = ({ title, children, description }) => (
  <div>
    <h1 className="display-3">{title}</h1>
    {description && <p className="lead">{description}</p>}
    {children}
  </div>
);
