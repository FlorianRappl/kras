import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Page, Loader } from '../components';

export interface HomeProps extends RouteComponentProps<{}> {
  children?: React.ReactNode;
}

interface HomeViewProps {
  data: {
    requests: Array<{
      id: string;
      time: string;
      from: string;
      status: number;
      type: string;
      injector: string;
    }>;
    errors: Array<{
      id: string;
      time: string;
      from: string;
      type: string;
    }>;
    messages: Array<{
      id: string;
      time: string;
      type: string;
      size: string;
    }>;
  };
  children?: React.ReactNode;
}

interface HomeViewState {
  activeTab: string;
}

interface TabNavItemProps {
  activeTab: string;
  name: string;
  onToggle(name: string): void;
}

const TabNavItem = ({ activeTab, onToggle, name }: TabNavItemProps) => (
  <NavItem>
    <NavLink
      style={{ cursor: 'pointer' }}
      href="#"
      className={activeTab === name ? 'active' : ''}
      onClick={(e) => { e.preventDefault(); onToggle(name); }}>
      {name}
    </NavLink>
  </NavItem>
);

function toTime(time: string) {
  const value = new Date(time);
  return value.toLocaleTimeString();
}

class HomeView extends React.Component<HomeViewProps, HomeViewState> {
  constructor(props: HomeViewProps) {
    super(props);
    this.state = {
      activeTab: 'Requests',
    };
  }

  private toggle = (tab: string) => {
    this.setState({
      activeTab: tab,
    });
  };

  render() {
    const { activeTab } = this.state;
    const { data } = this.props;
    const { errors, messages, requests } = data;

    return (
      <div>
        <Nav tabs pills>
          <TabNavItem activeTab={activeTab} name="Requests" onToggle={this.toggle} />
          <TabNavItem activeTab={activeTab} name="Messages" onToggle={this.toggle} />
          <TabNavItem activeTab={activeTab} name="Errors" onToggle={this.toggle} />
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="Requests">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>From</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Injector</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {
                  requests.map((req, i) => (
                    <tr key={req.id}>
                      <th scope="row">{requests.length - i}</th>
                      <td>{toTime(req.time)}</td>
                      <td>{req.from}</td>
                      <td>{req.status}</td>
                      <td>{req.type}</td>
                      <td>{req.injector}</td>
                      <td><a href={`#/requests/${req.id}`}>Details</a></td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </TabPane>
          <TabPane tabId="Messages">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {
                  messages.map((msg, i) => (
                    <tr key={msg.id}>
                      <th scope="row">{messages.length - i}</th>
                      <td>{toTime(msg.time)}</td>
                      <td>{msg.type}</td>
                      <td>{msg.size}</td>
                      <td><a href={`#/messages/${msg.id}`}>Details</a></td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </TabPane>
          <TabPane tabId="Errors">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Time</th>
                  <th>From</th>
                  <th>Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {
                  errors.map((err, i) => (
                    <tr key={err.id}>
                      <th scope="row">{errors.length - i}</th>
                      <td>{toTime(err.time)}</td>
                      <td>{err.from}</td>
                      <td>{err.type}</td>
                      <td><a href={`#/errors/${err.id}`}>Details</a></td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

export const Home = ({}: HomeProps) => (
  <Page title="Requests" description="Overview of the messages, succeeded and failed requests.">
    <Loader url="data" component={HomeView} />
  </Page>
);
