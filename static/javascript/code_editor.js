/* global $, CodeMirror, Split */

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

// update the html render. bottom half of the page
const runCode = () => {
  const iframeDocument = DOMElements.iframe.contentWindow.document;
  const htmlCode = editors.html.getValue();
  const jsCode = editors.js.getValue();

  iframeDocument.open();
  iframeDocument.write(`${htmlCode}<script>${jsCode}</script>`);
  iframeDocument.close();
};

$('#run-button').click(runCode);

// run code when ctrl + enter is pressed down
$(document).keydown(e => {
  if ((e.ctrlKey || e.metaKey) && (e.keyCode === 10 || e.keyCode === 13)) {
    runCode();
  }
});


// fetch data
const dataLoc = '/static/mock_data/exercise0.json';

fetch(dataLoc)
  .then(x => x.json())
  .then(data => {
    $('#task-placeholder').html(data.task);
    editors.html.setValue(data.html);
    editors.js.setValue(data.js);
  })
  .then(runCode);
