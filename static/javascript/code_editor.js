/* global $, CodeMirror, jsyaml, Split */
/* eslint-disable no-console */

// when user submits code, test it
// if any tests fail, set true
let codeFailedTests = false;

const fail = x => {
  codeFailedTests = true;
  console.error(x);
};

// references to page elements
const DOMElements = {
  iframe: $('iframe')[0],
};

// make editors and code output resizable
Split(['#html-editor-parent', '#js-editor-parent']);
Split(['#html-frame-view', '#console-area']);

// split editors and code ouput vertically
Split(['#editors', '#code-output'], {
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

// Run the HTML and JS code
const runCode = secret =>
  writeToFrame((html, js) => `${html}<script>{${secret}}{${js}}</script>`);

// Test to see if user completed the exercise
const testCode = (secret, test) => {
  codeFailedTests = false;

  const code = writeToFrame(
    (html, js) => `
      ${html}
      <script>
        {${secret}}
        {
          const fail = window.parent.fail;
          ${test.setup}
          { ${js} }
          ${test.run}
          ${test.cleanup}
        }
      </script>`,
  );

  // test if code exceeds maxLines
  if (test.maxLines < code.js.split('\n').length) {
    fail(
      `You must complete this exercise with ${
      test.maxLines
      } lines of JavaScript or less.`,
    );
  }

  // test if code contains certain strings
  test.has.forEach(piece => {
    const re = new RegExp(piece.regex);

    if (!re.test(code.js)) {
      fail(piece.message);
    }
  });

  // test if code does not contain certain strings
  test.hasNot.forEach(piece => {
    const re = new RegExp(piece.regex);

    if (re.test(code.js)) {
      fail(piece.message);
    }
  });

  if (!codeFailedTests) {
    console.log('yay! all tests passed!');
  }
};

fetch('/static/mock_data/exercise0.yml', {
  headers: {
    "Content-Type": "text/plain",
  },
})
  .then(data => data.text())
  .then(jsyaml.load)
  .then(data => {
    $('#run-button').click(() => runCode(data.secret));
    $('#submit-button').click(() => testCode(data.secret, data.test));

    // run code when ctrl + enter is pressed down
    $(document).keydown(e => {
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 10 || e.keyCode === 13)) {
        runCode(data.secret);
      }
    });

    // insert task to the page
    $('#task-placeholder').html(data.task);
    // insert code to the editors
    editors.html.setValue(data.html);
    editors.js.setValue(data.js);

    runCode(data.secret);
  });

window.fail = fail;
