import * as React from 'react';
import { Row, Col, Badge } from 'reactstrap';

export type DetailsFieldValue = string | Array<string> | {
  [name: string]: string;
};

export interface DetailsProps {
  fields: Array<{
    label: string;
    value: DetailsFieldValue;
  }>;
  children?: React.ReactNode;
}

interface FieldProps {
  label: string;
  value: DetailsFieldValue;
  children?: React.ReactNode;
}

const Field = ({ label, value }: FieldProps) => (
  <Row>
    <Col md={12}>
      <p><b>{label}</b></p>
      {
        Array.isArray(value) ? (
          <ul>
            {
              value.map((item, i) => (
                <li key={i}>{item}</li>
              ))
            }
          </ul>
        ) : (typeof value === 'object') ? (
          Object.keys(value).map((key, i) => (
            <p>
              <Badge color="secondary">{key}</Badge> {value[key]}
            </p>
          ))
        ) : <p>{value}</p>
      }
    </Col>
  </Row>
);

export const Details = ({ fields }: DetailsProps) => (
  <div>
    {
      fields.map((field, i) => (
        field.label && field.value && <Field key={i} label={field.label} value={field.value} />
      ))
    }
  </div>
);
