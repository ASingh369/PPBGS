/* global $, CodeMirror, Split */

// make editors and iframe views resizable
Split({
  columnGutters: [
    {
      track: 1,
      element: $('#split-column-1')[0],
    },
  ],
  rowGutters: [
    {
      track: 1,
      element: $('#split-row-1')[0],
    },
  ],
});

// references to page elements
const DOMElements = {
  iframe: $('iframe')[0],
};

// create codemirror instances.
const editors = {
  html: CodeMirror($('#html-editor')[0], {
    value: '<h1>Hello World!</h1>',
    lineNumbers: true,
    theme: 'neo',
    mode: 'htmlmixed',
    gutters: ['CodeMirror-lint-markers'],
    lint: true,
  }),
  js: CodeMirror($('#js-editor')[0], {
    value: 'console.log("Hello World!");',
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
const updateFrame = () => {
  const iframeDocument = DOMElements.iframe.contentWindow.document;
  const htmlCode = editors.html.getValue();
  const jsCode = editors.js.getValue();

  iframeDocument.open();
  iframeDocument.write(`${htmlCode}<script>${jsCode}</script>`);
  iframeDocument.close();
};

$('#run-button').click(updateFrame);
updateFrame();

$(document).keydown(e => {
  // if ctrl + enter is pressed down
  if ((e.ctrlKey || e.metaKey) && (e.keyCode === 10 || e.keyCode === 13)) {
    updateFrame();
  }
});
