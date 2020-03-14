import * as React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

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
