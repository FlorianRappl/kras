import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Table, Button } from 'reactstrap';
import { Page, Loader, Feed, Details } from '../components';
import { fullUrl, toTime, request } from '../utils';
import { config } from '../data';

export interface HomeProps extends RouteComponentProps<{}> {
  children?: React.ReactNode;
}

interface LogEntry {
  time: string;
  type: string;
  data: any;
}

interface HomeViewProps {
  data: {
    entries: Array<LogEntry>;
  };
}

interface HomeViewState {
  items: Array<LogEntry>;
}

class HomeView extends React.Component<HomeViewProps, HomeViewState> {
  constructor(props: HomeViewProps) {
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
  }

  render() {
    const { items } = this.state;
    const length = items.length;
    return (
      <Feed feed="logs" onMessage={this.dispatch}>
        <Details fields={[
          { label: 'Name', value: config.name },
          { label: 'Version', value: config.version },
          { label: 'Base Directory', value: config.directory }
        ]} />
        {
          !!items.length && (
            <div>
              <p className="lead">Available log entries.</p>
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
                  {
                    items.map((item, i) => (
                      <tr key={length - i}>
                        <th scope="row">{length - i}</th>
                        <td>{item.type}</td>
                        <td>{toTime(item.time)}</td>
                        <td>{JSON.stringify(item.data)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </Table>
              <Button color="danger" onClick={this.resetLog}>Clear All Logs</Button>
            </div>
          )
        }
      </Feed>
    );
  }
}

export const Home = ({}: HomeProps) => (
  <Page title="Overview" description="General overview and information.">
    <Loader url="logs" component={HomeView} />
  </Page>
);
