import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Table, Button } from 'reactstrap';
import { Page, Loader, Feed } from '../components';
import { fullUrl, toTime, request } from '../utils';

export interface LogsProps extends RouteComponentProps<{}> {}

interface LogEntry {
  time: string;
  type: string;
  data: any;
}

interface LogsViewProps {
  data: {
    entries: Array<LogEntry>;
  };
}

interface LogsViewState {
  items: Array<LogEntry>;
}

class LogsView extends React.Component<LogsViewProps, LogsViewState> {
  constructor(props: LogsViewProps) {
    super(props);
    this.state = {
      items: props.data.entries,
    };
  }

  private dispatch = (item: LogEntry) => {
    const { items } = this.state;
    this.setState({
      items: [item, ...items],
    });
  };

  private resetLog = () => {
    request({
      url: 'logs',
      method: 'DELETE',
    });
    this.setState({
      items: [],
    });
  };

  render() {
    const { items } = this.state;
    const length = items.length;

    return (
      <Feed feed="logs" onMessage={this.dispatch}>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Time</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={length - i}>
                <th scope="row">{length - i}</th>
                <td>{item.type}</td>
                <td>{toTime(item.time)}</td>
                <td>{JSON.stringify(item.data)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button color="danger" onClick={this.resetLog}>
          Clear All Logs
        </Button>
      </Feed>
    );
  }
}

export const Logs: React.SFC<LogsProps> = () => (
  <Page title="Logs" description="Captured log entries of the server.">
    <Loader url="logs" component={LogsView} />
  </Page>
);
