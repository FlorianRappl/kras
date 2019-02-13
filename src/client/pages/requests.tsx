import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { Page, Loader, Feed } from '../components';
import { toTime } from '../utils';

export interface RequestsParams {
  tab: string;
}

export interface RequestsProps extends RouteComponentProps<RequestsParams> {}

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
  origin: string;
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
  tab?: string;
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
}

const TabNavItem: React.SFC<TabNavItemProps> = ({ activeTab, name }) => (
  <NavItem>
    <NavLink
      style={{ cursor: 'pointer' }}
      tag={Link}
      className={activeTab === name ? 'active' : ''}
      {...{ to: `/requests/${name}` }}>
      {name}
    </NavLink>
  </NavItem>
);

class RequestsView extends React.Component<RequestsViewProps, RequestsViewState> {
  constructor(props: RequestsViewProps) {
    super(props);
    this.state = {
      activeTab: props.tab || 'Requests',
      ...props.data,
    };
  }

  componentWillReceiveProps(nextProps: RequestsViewProps) {
    if (nextProps.tab && nextProps.tab !== this.state.activeTab) {
      this.setState({
        activeTab: nextProps.tab,
      });
    }
  }

  private dispatch = (msg: KrasFeedMessage) => {
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
  };

  render() {
    const { activeTab, errors, messages, requests } = this.state;

    return (
      <Feed feed="data" onMessage={this.dispatch}>
        <Nav tabs pills>
          <TabNavItem activeTab={activeTab} name="Requests" />
          <TabNavItem activeTab={activeTab} name="Messages" />
          <TabNavItem activeTab={activeTab} name="Errors" />
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
                {requests.map((req, i) => (
                  <tr key={req.id}>
                    <th scope="row">{requests.length - i}</th>
                    <td>{toTime(req.time)}</td>
                    <td>{req.from}</td>
                    <td>{req.to}</td>
                    <td>{req.status}</td>
                    <td>{req.type}</td>
                    <td>{req.injector}</td>
                    <td>
                      <a href={`#/requests/request/${req.id}`}>Details</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TabPane>
          <TabPane tabId="Messages">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Origin</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, i) => (
                  <tr key={msg.id}>
                    <th scope="row">{messages.length - i}</th>
                    <td>{msg.origin}</td>
                    <td>{toTime(msg.time)}</td>
                    <td>{msg.type}</td>
                    <td>{msg.size}</td>
                    <td>
                      <a href={`#/requests/message/${msg.id}`}>Details</a>
                    </td>
                  </tr>
                ))}
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
                {errors.map((err, i) => (
                  <tr key={err.id}>
                    <th scope="row">{errors.length - i}</th>
                    <td>{toTime(err.time)}</td>
                    <td>{err.from}</td>
                    <td>{err.to}</td>
                    <td>{err.type}</td>
                    <td>
                      <a href={`#/requests/error/${err.id}`}>Details</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TabPane>
        </TabContent>
      </Feed>
    );
  }
}

export const Requests: React.SFC<RequestsProps> = ({ match }) => (
  <Page title="Requests" description="Overview of the messages, succeeded and failed requests.">
    <Loader url="data" component={RequestsView} forward={match.params} />
  </Page>
);
