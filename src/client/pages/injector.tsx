import * as React from 'react';
import { Row, Col, Label, Badge, Button, Input, FormGroup, FormText } from 'reactstrap';
import { Page } from '../components';

export interface InjectorProps {
  active: boolean;
  name: string;
  options: KrasInjectorOptions;
  children?: React.ReactNode;
  onSaveChanges(e: {
    options: KrasInjectorOptions,
  }): void;
}

export interface InjectorState {
  hasChanges: boolean;
  options: KrasInjectorOptions;
}

export interface KrasInjectorStringOption {
  type: 'text';
  value: string;
}

export interface KrasInjectorCheckboxOption {
  type: 'checkbox';
  value: boolean;
}

export type KrasInjectorOption = KrasInjectorStringOption | KrasInjectorCheckboxOption;

export interface KrasInjectorOptions {
  [name: string]: {
    title: string;
    description: string;
  } & KrasInjectorOption;
}

function compareOptions(original: KrasInjectorOptions, options: KrasInjectorOptions) {
  for (const option of Object.keys(original)) {
    if (options[option].value !== original[option].value) {
      return false;
    }
  }

  return true;
}

export class Injector extends React.Component<InjectorProps, InjectorState> {
  constructor(props: InjectorProps) {
    super(props);
    this.state = {
      hasChanges: false,
      options: {
        ...props.options,
      },
    };
  }

  private changeOption(e: React.ChangeEvent<HTMLInputElement>, name: string) {
    const { options: previousOptions } = this.state;
    const { options: originalOptions } = this.props;
    const option = previousOptions[name];
    const newOptions = {
      ...previousOptions,
    };

    switch (option.type) {
      case 'checkbox':
        newOptions[name] = {
          ...option,
          value: e.target.checked,
        };
        break;
      case 'text':
        newOptions[name] = {
          ...option,
          value: e.target.value,
        };
        break;
    }


    this.setState({
      hasChanges: !compareOptions(originalOptions, newOptions),
      options: newOptions,
    });
  }

  private renderInput(name: string) {
    const { options } = this.state;
    const option = options[name];
    let input: React.ReactChild;

    switch (option.type) {
      case 'checkbox':
        input = (
          <FormGroup check>
            <Label check>
              <Input type="checkbox" checked={option.value} onChange={(e) => this.changeOption(e, name)} /> Enabled
            </Label>
          </FormGroup>
        );
        break;
      case 'text':
        input = <Input type="text" value={option.value} onChange={(e) => this.changeOption(e, name)} />;
        break;
    }

    return (
      <FormGroup key={name}>
        <Label>
          {option.title}
        </Label>
        {input}
        <FormText>
          {option.description}
        </FormText>
      </FormGroup>
    );
  }

  private saveChanges = () => {
    const { onSaveChanges } = this.props;
    const { options } = this.state;

    if (typeof onSaveChanges === 'function') {
      onSaveChanges({
        options,
      });
    }

    this.setState({
      hasChanges: false,
    });
  }

  render() {
    const { active, name } = this.props;
    const { options, hasChanges } = this.state;

    return  (
      <Row>
        <Col sm="12">
          <div>
            <Badge color={active ? 'success' : 'secondary'}>
              {active ? 'Active' : 'Disabled'}
            </Badge>
          </div>
          <h4>
            {name}
          </h4>
          {Object.keys(options).map(name => this.renderInput(name))}
          <Button color="primary" disabled={!hasChanges} onClick={this.saveChanges}>Save Changes</Button>
        </Col>
      </Row>
    );
  }
}
