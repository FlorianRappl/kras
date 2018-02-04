import * as React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Alert } from 'reactstrap';
import { RouteComponentProps } from 'react-router';
import { Page, Loader } from '../components';
import { Injector, KrasInjectorOptions } from './injector';
import { request } from '../utils';

export interface InjectorsProps extends RouteComponentProps<{}> {
  children?: React.ReactNode;
}

interface KrasInjector {
  name: string;
  active: boolean;
  options: KrasInjectorOptions;
}

interface KrasInjectors {
  injectors: Array<KrasInjector>;
}

interface InjectorsViewProps {
  data: KrasInjectors;
  children?: React.ReactNode;
}

interface InjectorsViewState {
  injectors: Array<KrasInjector>;
  activeTab: string;
}

class InjectorsView extends React.Component<InjectorsViewProps, InjectorsViewState> {
  constructor(props: InjectorsViewProps) {
    super(props);

    this.state = {
      injectors: props.data.injectors,
      activeTab: props.data.injectors.map(inj => inj.name)[0],
    };
  }

  private toggle(e: React.MouseEvent<any>, activeTab: string) {
    if (this.state.activeTab !== activeTab) {
      this.setState({
        activeTab,
      });
    }

    e.preventDefault();
  };

  private saveChanges(injector: KrasInjector, options: KrasInjectorOptions) {
    const { injectors } = this.state;
    const data: { [x: string]: any; } = {};

    for (const option of Object.keys(options)) {
      data[option] = options[option].value;
    }

    request({
      method: 'PUT',
      url: `injector/${injector.name}`,
      body: JSON.stringify(data),
    });

    this.setState({
      injectors: injectors.map(inj => inj !== injector ? inj : ({
        ...injector,
        options,
      })),
    });
  }

  render() {
    const { injectors, activeTab } = this.state;

    if (injectors.length === 0) {
      return (
        <Alert color="warning">
          No injectors loaded.
        </Alert>
      );
    }

    return (
      <div>
        <Nav tabs>
          {
            injectors.map(injector => (
              <NavItem key={injector.name}>
                <NavLink
                  style={{ cursor: 'pointer' }}
                  href="#"
                  className={activeTab === injector.name ? 'active' : '' }
                  onClick={(e) => this.toggle(e, injector.name)}>
                  {injector.name}
                </NavLink>
              </NavItem>
            ))
          }
        </Nav>
        <TabContent activeTab={activeTab}>
          {
            injectors.map(injector => (
              <TabPane tabId={injector.name} key={injector.name}>
                <Injector name={injector.name} active={injector.active} options={injector.options} onSaveChanges={({ options }) => this.saveChanges(injector, options)} />
              </TabPane>
            ))
          }
        </TabContent>
      </div>
    );
  }
}

export const Injectors = ({}: InjectorsProps) => (
  <Page title="Injectors" description="Injector specific settings and options to play around with.">
    <Loader component={InjectorsView} url="injector" />
  </Page>
);
