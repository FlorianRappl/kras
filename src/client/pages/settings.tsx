import * as React from 'react';
import { FormGroup, Label, Input, Button } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { Page, Panel, Loader } from '../components';
import { request, fullUrl } from '../utils';

export interface SettingsProps extends RouteComponentProps<{}> {}

interface KrasSettings {
  ws: boolean;
  injectors: Array<{
    name: string;
    active: boolean;
  }>;
}

interface SettingsViewProps {
  data: KrasSettings;
}

interface SettingsViewState {
  ws: boolean;
  wsOriginal: boolean;
  injectors: Array<{
    name: string;
    active: boolean;
    activeOriginal: boolean;
  }>;
}

class SettingsView extends React.Component<SettingsViewProps, SettingsViewState> {
  constructor(props: SettingsViewProps) {
    super(props);
    this.state = {
      ws: props.data.ws,
      wsOriginal: props.data.ws,
      injectors: props.data.injectors.map(injector => ({
        ...injector,
        activeOriginal: injector.active,
      })),
    };
  }

  private changeWs = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      ws: e.target.checked,
    });
  };

  private changeInjector(index: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        injectors: this.state.injectors.map((injector, i) => {
          if (i === index) {
            return {
              name: injector.name,
              active: e.target.checked,
              activeOriginal: injector.activeOriginal,
            };
          }

          return injector;
        }),
      });
    };
  }

  private saveChanges = () => {
    const { ws, injectors } = this.state;

    request({
      url: 'settings',
      body: JSON.stringify({
        ws,
        injectors: injectors.map(injector => ({
          name: injector.name,
          active: injector.active,
        })),
      }),
      method: 'PUT',
    });

    this.setState({
      wsOriginal: ws,
      injectors: injectors.map(injector => ({
        ...injector,
        activeOriginal: injector.active,
      })),
    });
  };

  private downloadSettings = () => {
    const url = fullUrl('settings/file');
    location.href = url;
  };

  render() {
    const { ws, wsOriginal, injectors } = this.state;
    const hasChanges = ws !== wsOriginal || injectors.filter(inj => inj.active !== inj.activeOriginal).length > 0;

    return (
      <div>
        <Panel title="General" type="primary">
          <FormGroup check>
            <Label check>
              <Input type="checkbox" checked={ws} onChange={this.changeWs} /> Activate WebSocket
            </Label>
          </FormGroup>
        </Panel>
        <Panel title="Available Injectors" type="primary">
          {injectors.map((injector, index) => (
            <FormGroup check key={injector.name}>
              <Label check>
                <Input type="checkbox" checked={injector.active} onChange={this.changeInjector(index)} /> Activate{' '}
                {injector.name}
              </Label>
            </FormGroup>
          ))}
        </Panel>
        <Button color="primary" onClick={this.saveChanges} disabled={!hasChanges}>
          Save Changes
        </Button>
        {' | '}
        <Button color="info" onClick={this.downloadSettings}>
          Download Settings
        </Button>
      </div>
    );
  }
}

export const Settings: React.SFC<SettingsProps> = () => (
  <Page title="Settings" description="General application settings and dynamic configuration possibilities.">
    <Loader component={SettingsView} url="settings" />
  </Page>
);
