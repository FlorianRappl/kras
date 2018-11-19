import * as React from 'react';
import { Row, Col, Label, Badge, Button, Input, FormGroup, FormText } from 'reactstrap';
import { Page, TextEditor } from '../components';
import { Editor } from './editor';
import { areDifferent, areEqual } from '../utils';

export interface InjectorProps {
  active: boolean;
  name: string;
  options: KrasInjectorOptions;
  onSaveChanges(e: { options: KrasInjectorOptions }): void;
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

export interface KrasInjectorFileOption {
  type: 'file';
  value: Array<{
    id: string;
    name: string;
    basename: string;
    active: boolean;
    error?: string;
  }>;
}

export interface KrasInjectorJsonOption {
  type: 'json';
  value: string;
}

export interface KrasInjectorDirectoryOption {
  type: 'directory';
  value: Array<string>;
}

export interface KrasInjectorEntryOption {
  type: 'entry';
  value: Array<{
    id: string;
    name: string;
    basename: string;
    entries: Array<{
      active: boolean;
      description: string;
      error?: string;
    }>;
  }>;
}

export type KrasInjectorOption =
  | KrasInjectorStringOption
  | KrasInjectorCheckboxOption
  | KrasInjectorFileOption
  | KrasInjectorDirectoryOption
  | KrasInjectorEntryOption
  | KrasInjectorJsonOption;

export interface KrasInjectorOptions {
  [name: string]: {
    title: string;
    description: string;
  } & KrasInjectorOption;
}

function compareOptions(original: KrasInjectorOptions, options: KrasInjectorOptions) {
  for (const option of Object.keys(original)) {
    if (options[option]) {
      const a = options[option].value;
      const b = original[option].value;

      if (!areEqual(a, b)) {
        return false;
      }
    } else {
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

  componentWillReceiveProps(nextProps: InjectorProps) {
    const currentKeys = Object.keys(this.state.options);
    const nextKeys = Object.keys(nextProps.options);

    if (areDifferent(currentKeys, nextKeys)) {
      this.setState({
        hasChanges: false,
        options: {
          ...nextProps.options,
        },
      });
    }
  }

  private changeTextOption(value: string, name: string, index?: number, position?: number) {
    const { options: previousOptions } = this.state;
    const option = previousOptions[name];
    const newOptions = {
      ...previousOptions,
    };

    switch (option.type) {
      case 'text':
        newOptions[name] = {
          ...option,
          value,
        };
        break;
      case 'directory':
        newOptions[name] = {
          ...option,
          value: option.value.map((item, i) => (i !== index ? item : value)),
        };
        break;
      case 'json':
        newOptions[name] = {
          ...option,
          value,
        };
        break;
    }

    this.setOptions(newOptions);
  }

  private changeBooleanOption(value: boolean, name: string, index?: number, position?: number) {
    const { options: previousOptions } = this.state;
    const option = previousOptions[name];
    const newOptions = {
      ...previousOptions,
    };

    switch (option.type) {
      case 'checkbox':
        newOptions[name] = {
          ...option,
          value,
        };
        break;
      case 'file':
        newOptions[name] = {
          ...option,
          value: option.value.map((item, i) =>
            i !== index
              ? item
              : {
                  ...item,
                  active: value,
                },
          ),
        };
        break;
      case 'entry':
        newOptions[name] = {
          ...option,
          value: option.value.map((item, i) =>
            i !== index
              ? item
              : {
                  ...item,
                  entries: item.entries.map((entry, j) =>
                    position !== undefined && j !== position
                      ? entry
                      : {
                          ...entry,
                          active: value,
                        },
                  ),
                },
          ),
        };
        break;
    }

    this.setOptions(newOptions);
  }

  private setOptions(options: KrasInjectorOptions) {
    const { options: originalOptions } = this.props;

    this.setState({
      hasChanges: !compareOptions(originalOptions, options),
      options,
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
              <Input
                type="checkbox"
                checked={option.value}
                onChange={e => this.changeBooleanOption(e.target.checked, name)}
              />{' '}
              Enabled
            </Label>
          </FormGroup>
        );
        break;
      case 'text':
        input = <Input type="text" value={option.value} onChange={e => this.changeTextOption(e.target.value, name)} />;
        break;
      case 'json':
        input = (
          <TextEditor mode="json" height="8em" value={option.value} onChange={e => this.changeTextOption(e, name)} />
        );
        break;
      case 'file':
      case 'directory':
      case 'entry':
        return this.renderMultiInput(name);
    }

    return (
      <FormGroup key={name}>
        <Label>{option.title}</Label>
        {input}
        <FormText>{option.description}</FormText>
      </FormGroup>
    );
  }

  private renderMultiInput(name: string) {
    const { options } = this.state;
    const option = options[name];
    let content: React.ReactChild;

    switch (option.type) {
      case 'directory':
        content = (
          <div>
            {option.value.map((directory, i) => (
              <div style={{ margin: '0.5em 0' }} key={i}>
                <FormGroup>
                  <Input type="text" value={directory} onChange={e => this.changeTextOption(e.target.value, name, i)} />
                </FormGroup>
              </div>
            ))}
          </div>
        );
        break;
      case 'entry':
        content = (
          <div>
            {option.value.map((file, i) => (
              <div style={{ margin: '0.5em 0' }} key={file.id}>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={file.entries.filter(m => m.active).length > 0}
                      onChange={e => this.changeBooleanOption(e.target.checked, name, i)}
                    />{' '}
                    {file.basename}
                  </Label>
                  <FormText>
                    <Button color="info" size="sm" href={`#/editor/${file.id}`}>
                      Open File in Editor
                    </Button>{' '}
                    {file.name}
                  </FormText>
                </FormGroup>
                <div style={{ marginLeft: '1.5em' }}>
                  {file.entries.map((entry, j) => (
                    <FormGroup check key={j}>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={entry.active}
                          onChange={e => this.changeBooleanOption(e.target.checked, name, i, j)}
                        />{' '}
                        {entry.description}
                      </Label>
                    </FormGroup>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        break;
      case 'file':
        content = (
          <div>
            {option.value.map((file, i) => (
              <div style={{ margin: '0.5em 0' }} key={file.id}>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={file.active}
                      onChange={e => this.changeBooleanOption(e.target.checked, name, i)}
                    />{' '}
                    {file.basename}
                  </Label>
                  <FormText>
                    <Button color="info" size="sm" href={`#/editor/${file.id}`}>
                      Open File in Editor
                    </Button>{' '}
                    {file.name}
                  </FormText>
                </FormGroup>
              </div>
            ))}
          </div>
        );
        break;
    }

    return (
      <FormGroup key={name}>
        <Label>{option.title}</Label>
        <FormText>{option.description}</FormText>
        {content}
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
  };

  render() {
    const { active, name } = this.props;
    const { options, hasChanges } = this.state;

    return (
      <Row>
        <Col sm="12">
          <h4>
            <Badge color={active ? 'success' : 'secondary'}>{active ? 'Active' : 'Disabled'}</Badge>
            {' ' + name}
          </h4>
          {Object.keys(options).map(name => this.renderInput(name))}
          <Button color="primary" disabled={!hasChanges} onClick={this.saveChanges}>
            Save Changes
          </Button>
        </Col>
      </Row>
    );
  }
}
