import * as React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/yaml';
import 'brace/mode/xml';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/theme/tomorrow';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

const editor = {
  $blockScrolling: Infinity,
};
const options = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: false,
  enableSnippets: false,
  showLineNumbers: true,
  tabSize: 2,
};

export interface TextEditorProps {
  mode: string;
  value: string;
  height?: string;
  onChange?: (value: string) => void;
}

export const TextEditor: React.SFC<TextEditorProps> = ({ mode, value, height, onChange }) => (
  <AceEditor
    mode={mode}
    theme="tomorrow"
    onChange={onChange}
    height={height}
    fontSize={14}
    showPrintMargin
    width="100%"
    showGutter
    highlightActiveLine
    value={value}
    editorProps={editor}
    setOptions={options}
  />
);
