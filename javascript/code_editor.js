var html = CodeMirror.fromTextArea(document.getElementById("html"), {
  mode: "xml",
  theme: "dracula",
  lineNumbers: true
});
var js = CodeMirror.fromTextArea(document.getElementById("js"), {
  mode: "javascript",
  theme: "dracula",
  lineNumbers: true
});

window.onload = function () {
    var result = document.getElementById("result").contentWindow;
    result.console.stdlog = console.log.bind(console);
    result.console.logs = [];
    result.console.log = function(){
        result.console.logs.push(Array.from(arguments));
        result.console.stdlog.apply(console, arguments);
    };

    compile();
};

function compile() {
  var html_final = html.getValue();
  var js_final = js.getValue();
  var result = document.getElementById("result").contentWindow.document;
  var resultWindow = document.getElementById("result").contentWindow;
  result.open();
  result.writeln(html_final + "<script>" + js_final + "</script>");
  result.close();
  console.log(resultWindow.console.logs);
}
