/* global $, CodeMirror, Split */
/* eslint-disable no-console */

let codeFailedTests = false;

const fail = x => {
  codeFailedTests = true;
  console.error(x);
}

// references to page elements
const DOMElements = {
  iframe: $('iframe')[0],
};

// make editors resizable
Split(['#html-editor-parent', '#js-editor-parent']);

// split editors and frame vertically
Split(['#editors', '#frame'], {
  direction: 'vertical',
  sizes: [40, 60],
});

// create codemirror instances.
const editors = {
  html: CodeMirror($('#html-editor')[0], {
    lineNumbers: true,
    theme: 'neo',
    mode: 'htmlmixed',
    gutters: ['CodeMirror-lint-markers'],
    lint: true,
  }),
  js: CodeMirror($('#js-editor')[0], {
    lineNumbers: true,
    theme: 'neo',
    mode: 'javascript',
    gutters: ['CodeMirror-lint-markers'],
    lint: {
      esversion: 6,
    },
  }),
};

// write code to the iframe
// precondition: fn :: (html code, js code) -> string
const writeToFrame = fn => {
  const iframeDocument = DOMElements.iframe.contentWindow.document;
  const htmlCode = editors.html.getValue();
  const jsCode = editors.js.getValue();
  const cbCode = fn(htmlCode, jsCode);

  iframeDocument.open();
  iframeDocument.write(cbCode);
  iframeDocument.close();

  return {
    html: htmlCode,
    js: jsCode,
    cb: cbCode,
  };
};

// update the html render. bottom half of the page
const runCode = () =>
  writeToFrame((html, js) => `${html}<script>${js}</script>`);

$('#run-button').click(runCode);

// run code when ctrl + enter is pressed down
$(document).keydown(e => {
  if ((e.ctrlKey || e.metaKey) && (e.keyCode === 10 || e.keyCode === 13)) {
    runCode();
  }
});

const testCode = test => {
  codeFailedTests = false;

  const code = writeToFrame((html, js) => `${html}<script>${js}</script>`);

  test.has.forEach(piece => {
    const re = new RegExp(piece.regex);

    if (!re.test(code.js)) {
      fail(`Missing: ${piece.readable}`);
    }
  });

  test.hasNot.forEach(piece => {
    const re = new RegExp(piece.regex);

    if (re.test(code.js)) {
      fail(`Cannot use: ${piece.readable}`);
    }
  });

  if (!codeFailedTests) {
    console.log('yay! all tests passed!');
  }
};

// fetch data
const dataLoc = '/static/mock_data/exercise0.json';

fetch(dataLoc)
  .then(x => x.json())
  .then(data => {
    $('#submit-button').click(() => testCode(data.test));
    $('#task-placeholder').html(data.task);
    editors.html.setValue(data.html);
    editors.js.setValue(data.js);
  })
  .then(runCode);
