import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Page, Loader } from '../components';
import { fullUrl } from '../utils';

export interface RequestsProps extends RouteComponentProps<{}> {
  children?: React.ReactNode;
}

interface KrasRequestData {
  id: string;
  time: string;
  from: string;
  to: string;
  status: number;
  type: string;
  injector: string;
}

interface KrasErrorData {
  id: string;
  time: string;
  from: string;
  to: string;
  type: string;
}

interface KrasMessageData {
  id: string;
  time: string;
  type: string;
  size: string;
}

interface KrasFeedRequestMessage {
  type: 'request';
  data: KrasRequestData;
}

interface KrasFeedErrorMessage {
  type: 'error';
  data: KrasErrorData;
}

interface KrasFeedMessageMessage {
  type: 'message';
  data: KrasMessageData;
}

type KrasFeedMessage = KrasFeedRequestMessage | KrasFeedErrorMessage | KrasFeedMessageMessage;

interface RequestsViewProps {
  data: {
    requests: Array<KrasRequestData>;
    errors: Array<KrasErrorData>;
    messages: Array<KrasMessageData>;
  };
  children?: React.ReactNode;
}

interface RequestsViewState {
  activeTab: string;
  requests: Array<KrasRequestData>;
  errors: Array<KrasErrorData>;
  messages: Array<KrasMessageData>;
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

class RequestsView extends React.Component<RequestsViewProps, RequestsViewState> {
  private ws: WebSocket;

  constructor(props: RequestsViewProps) {
    super(props);
    this.state = {
      activeTab: 'Requests',
      ...props.data,
    };
  }

  private dispatch(msg: KrasFeedMessage) {
    switch (msg.type) {
      case 'request':
        this.setState({
          requests: [msg.data, ...this.state.requests],
        });
        break;
      case 'error':
        this.setState({
          errors: [msg.data, ...this.state.errors],
        });
        break;
      case 'message':
        this.setState({
          messages: [msg.data, ...this.state.messages],
        });
        break;
    }
  }

  componentWillMount() {
    const url = `ws${fullUrl('data').substr(4)}`;

    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = (ev) => {
        this.dispatch(JSON.parse(ev.data));
      };
    } catch (e) {
      console.error(`WebSocket connection cannot be established - make sure to activate WebSockets for receiving live updates.`);
    }
  }

  componentWillUnmount() {
    this.ws.close();
  }

  private toggle = (tab: string) => {
    this.setState({
      activeTab: tab,
    });
  };

  render() {
    const { activeTab, errors, messages, requests } = this.state;

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
                  <th>To</th>
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
                      <td>{req.to}</td>
                      <td>{req.status}</td>
                      <td>{req.type}</td>
                      <td>{req.injector}</td>
                      <td><a href={`#/requests/request/${req.id}`}>Details</a></td>
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
                      <td><a href={`#/requests/message/${msg.id}`}>Details</a></td>
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
                  <th>To</th>
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
                      <td>{err.to}</td>
                      <td>{err.type}</td>
                      <td><a href={`#/requests/error/${err.id}`}>Details</a></td>
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

export const Requests = ({}: RequestsProps) => (
  <Page title="Requests" description="Overview of the messages, succeeded and failed requests.">
    <Loader url="data" component={RequestsView} />
  </Page>
);
