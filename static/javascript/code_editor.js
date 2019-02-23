/* global $, CodeMirror, Split */

// make editors resizable
Split(['#html-editor-parent', '#js-editor-parent']);

// split editors and frame vertically
Split(['#editors', '#frame'], {
  direction: 'vertical',
  sizes: [40, 60],
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
const updateFrame = cm => {
  const iframeDocument = DOMElements.iframe.contentWindow.document;
  const htmlCode = cm.getValue();

  iframeDocument.open();
  iframeDocument.write(htmlCode);
  iframeDocument.close();
};

editors.html.on('change', updateFrame);
updateFrame(editors.html);
