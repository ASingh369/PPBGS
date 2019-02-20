/* global $, CodeMirror, Split */

Split(['#html-editor-parent', '#js-editor-parent']);

const editors = {
  html: CodeMirror.fromTextArea($('#html-editor')[0]),
  js: CodeMirror.fromTextArea($('#js-editor')[0], {
    lineNumbers: true,
    theme: 'neo',
    mode: 'javascript',
    gutters: ['CodeMirror-lint-markers'],
    lint: {
      esversion: 6,
    },
  }),
};
