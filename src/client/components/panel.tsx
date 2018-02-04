import * as React from 'react';
import { Card, CardTitle, CardBody } from 'reactstrap';

export interface PanelProps {
  title: string;
  type?: 'info' | 'primary' | 'error';
  children?: React.ReactNode;
}

export const Panel = ({ title, type = 'info', children }: PanelProps) => (
  <div style={{ margin: '1em 0' }}>
    <Card body outline color={type}>
      <CardTitle>
        {title}
      </CardTitle>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  </div>
);
