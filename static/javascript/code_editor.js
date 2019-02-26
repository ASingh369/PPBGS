/* global $, CodeMirror, jsyaml, Split */
/* eslint-disable no-console */

const state = {
  // when user submits code, test it
  // if any tests fail, set true
  codeFailedTests: undefined,
  // console pane is visible
  consoleShowned: false,
  // save split size between html view and console
  consoleSplitSize: [60, 40],
};

// references to page elements
const DOMElements = {
  iframe: $('iframe')[0],
  console: $('#console-output')[0],
};

// make editors and code output resizable
const splits = {
  left: Split(['#html-editor-parent', '#js-editor-parent'], {
    direction: 'vertical',
    sizes: [50, 50],
  }),
  right: Split(['#html-frame-view', '#console-area'], {
    direction: 'vertical',
    sizes: [100, 0],
    minSize: 0,
  }),
  cols: Split(['#editors', '#code-output'], {
    minSize: 200,
  }),
};

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

const log = x => {
  $(DOMElements.console).append(`<samp>${x}</samp><br />`);
  console.log(x);
};

const fail = x => {
  state.codeFailedTests = true;
  $(DOMElements.console).append(`<code>${x}</code><br />`);
  console.error(x);
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

// toggle console visibility
const toggleConsole = () => {
  // if the console is visible, save the size and make hidden
  if (state.consoleShowned) {
    state.consoleSplitSize = splits.right.getSizes();
    splits.right.setSizes([100, 0]);
  } else {
    splits.right.setSizes(state.consoleSplitSize);
  }

  state.consoleShowned = !state.consoleShowned;
};

// Test to see if user completed the exercise
const testCode = (secret, test) => {
  state.codeFailedTests = false;

  $(DOMElements.console).empty();

  const code = writeToFrame(
    (html, js) => `
      ${html}
      <script>
        console.log = window.parent.log;
        {${secret}}
        {
          const fail = window.parent.fail;
          ${test.setup}
          try {
            {${js}}
          } catch (e) {
            window.parent.fail(e.message);
          }
          ${test.run}
          ${test.cleanup}
        }
      </script>`,
  );

  // test if code exceeds maxLines
  if (test.maxLines < code.js.trim().split('\n').length) {
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

  if (!state.codeFailedTests) {
    log('<span style="color: var(--green)">Yay! All tests passed!</span>');
  }
};

$('#toggle-console-button').click(() => {
  $(this).toggleClass('active');
  toggleConsole();
});

fetch('../../static/mock_data/exercise0.yml', {
  headers: {
    'Content-Type': 'text/plain',
  },
})
  .then(data => data.text())
  .then(jsyaml.load)
  .then(data => {
    $('#submit-button').click(() => {
      state.consoleShowned = true;
      splits.right.setSizes(state.consoleSplitSize);
      testCode(data.secret, data.test)
    });

    // test code when ctrl + enter is pressed down
    $(document).keydown(e => {
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === 10 || e.keyCode === 13)) {
        testCode(data.secret, data.test);
      }
    });

    // insert task to the page
    $('#task-placeholder').html(data.task);

    // insert code to the editors
    editors.html.setValue(data.html);
    editors.js.setValue(data.js);

    testCode(data.secret, data.test);
  });

window.fail = fail;
window.log = log;
