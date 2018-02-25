import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Card, CardBody, CardSubtitle, Alert } from 'reactstrap';
import { Page, Loader } from '../components';
import { request } from '../utils';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/yaml';
import 'brace/mode/xml';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/theme/tomorrow';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export interface EditorParams {
  file: string;
}

export interface EditorProps extends RouteComponentProps<EditorParams> {
  children?: React.ReactNode;
}

interface EditorViewProps {
  data: {
    file: string;
    content: string;
    type: string;
  };
  file: string;
}

interface EditorViewState {
  value: string;
  mode: string;
  alert?: {
    text: string;
    color: string;
  };
}

function getMode(type: string) {
  switch (type) {
    case '.json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case '.html':
    case '.xml':
      return 'xml';
    case '.js':
    case '.ts':
    case '.tsx':
    case '.jsx':
      return 'javascript';
    default:
      return 'plain_text';
  }
}

class EditorView extends React.Component<EditorViewProps, EditorViewState> {
  constructor(props: EditorViewProps) {
    super(props);
    this.state = {
      value: props.data.content || '',
      mode: getMode(props.data.type || 'js'),
    };
  }

  private onChange = (value: string) => {
    this.setState({
      value,
    });
  };

  private saveFile = () => {
    const { file } = this.props;
    const { value } = this.state;

    request({
      url: `file/${file}`,
      method: 'PUT',
      body: value,
    }).then(() => this.setState({
        alert: {
          text: 'File saved successfully.',
          color: 'success',
        },
      }))
      .catch(err => this.setState({
        alert: {
          text: `Error saving file: ${err}.`,
          color: 'danger',
        },
      }));
  };

  private dismissAlert = () => {
    this.setState({
      alert: undefined,
    });
  }

  render() {
    const { data } = this.props;
    const { mode, value, alert } = this.state;

    return (
      <Card>
        <CardBody>
          <CardSubtitle>
            {data.file}
          </CardSubtitle>
        </CardBody>
        <AceEditor
          mode={mode}
          theme="tomorrow"
          onChange={this.onChange}
          fontSize={14}
          showPrintMargin
          width="100%"
          showGutter
          highlightActiveLine
          value={value}
          editorProps={{
            $blockScrolling: Infinity,
          }}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }} />
        <CardBody>
          <Alert color={alert && alert.color} isOpen={!!alert} toggle={this.dismissAlert}>
            {alert && alert.text}
          </Alert>
          <Button color="primary" onClick={this.saveFile}>Save</Button>
        </CardBody>
      </Card>
    );
  }
}

export const Editor = ({ match }: EditorProps) => (
  <Page title="Editor" description="Modifies the file directly in the browser.">
    <Loader url={`file/${match.params.file}`} component={EditorView} forward={match.params} />
  </Page>
);
