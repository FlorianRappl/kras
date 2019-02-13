import * as React from 'react';
import { Row, Col, Badge } from 'reactstrap';

export type DetailsFieldValue =
  | string
  | Array<string>
  | {
      [name: string]: string;
    };

export interface DetailsProps {
  fields: Array<{
    label: string;
    value: DetailsFieldValue;
  }>;
}

interface FieldProps {
  label: string;
  value: DetailsFieldValue;
}

const Field: React.SFC<FieldProps> = ({ label, value }) => (
  <Row>
    <Col md={12}>
      <p>
        <b>{label}</b>
      </p>
      {Array.isArray(value) ? (
        <ul>
          {value.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : typeof value === 'object' ? (
        Object.keys(value).map((key, i) => (
          <p>
            <Badge color="secondary">{key}</Badge> {value[key]}
          </p>
        ))
      ) : typeof value === 'string' ? (
        <p>{value}</p>
      ) : (
        value
      )}
    </Col>
  </Row>
);

export const Details: React.SFC<DetailsProps> = ({ fields }) => (
  <div>
    {fields.map((field, i) => field.label && field.value && <Field key={i} label={field.label} value={field.value} />)}
  </div>
);
