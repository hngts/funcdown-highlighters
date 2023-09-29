"use strict";
ace.define("ace/mode/folding/coffee",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode","ace/range"],
function(require, exports, module) {

  var oop = require("../../lib/oop");
  var BaseFoldMode = require("./fold_mode").FoldMode;
  var Range = require("../../range").Range;

  var FoldMode = exports.FoldMode = function() {};
  oop.inherits(FoldMode, BaseFoldMode);

  (function() {

    this.getFoldWidgetRange = function(session, foldStyle, row) {
      var range = this.indentationBlock(session, row);
      if (range)
        return range;

      var re = /\S/;
      var line = session.getLine(row);
      var startLevel = line.search(re);
      if (startLevel == -1 || line[startLevel] != "#")
        return;

      var startColumn = line.length;
      var maxRow = session.getLength();
      var startRow = row;
      var endRow = row;

      while (++row < maxRow) {
        line = session.getLine(row);
        var level = line.search(re);

        if (level == -1)
            continue;

        if (line[level] != "#")
            break;

        endRow = row;
      }

      if (endRow > startRow) {
        var endColumn = session.getLine(endRow).length;
        return new Range(startRow, startColumn, endRow, endColumn);
      }
    };

    this.getFoldWidget = function(session, foldStyle, row) {
      var line = session.getLine(row);
      var indent = line.search(/\S/);
      var next = session.getLine(row + 1);
      var prev = session.getLine(row - 1);
      var prevIndent = prev.search(/\S/);
      var nextIndent = next.search(/\S/);

      if (indent == -1) {
        session.foldWidgets[row - 1] = prevIndent!= -1 && prevIndent < nextIndent ? "start" : "";
        return "";
      }
      if (prevIndent == -1) {
        if (indent == nextIndent && line[indent] == "#" && next[indent] == "#") {
          session.foldWidgets[row - 1] = "";
          session.foldWidgets[row + 1] = "";
          return "start";
        }
      } else if (prevIndent == indent && line[indent] == "#" && prev[indent] == "#") {
        if (session.getLine(row - 2).search(/\S/) == -1) {
          session.foldWidgets[row - 1] = "start";
          session.foldWidgets[row + 1] = "";
          return "";
        }
      }

      if (prevIndent!= -1 && prevIndent < indent)
        session.foldWidgets[row - 1] = "start";
      else
        session.foldWidgets[row - 1] = "";

      if (indent < nextIndent)
        return "start";
      else
        return "";
    };

  }).call(FoldMode.prototype);

});

ace.define ("ace/mode/funcdown", [
  "require","exports","module", "ace/lib/oop"," ace/mode/text", "ace/mode/text_highlight_rules","ace/mode/folding/coffee"
], function (require, exports, module)
{
  var oop = require("../lib/oop");
  var TextMode = require("./text").Mode;
  var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

  var FuncdownHighlightRules = function() {

      let
      fncd = {
        php: "support.php_tag",
        node: "meta.tag.tag-name.xml.bold",
        attribute: "support.constant.fonts",
        attribute_operator: "keyword.operator.logical",
        content: "text.xml",
        microdown: "string.quoted.single"
      },
      pcre = {
        phpOperators: "::|!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|!=|!==|<=|>=|=>|<<=|>>=|>>>=|<>|<|>|\\.=|=|!|&&|\\|\\||\\?\\:|\\*=|/=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)",
        attributes: "\\\\\\\(|\\\\\\\)|\\\\\\\{|\\\\\\,|\\\\\\'|\\\\\\\"",
        qqstring: /\$[\w]+(?:\[[\w\]+]|[=\-]>\w+)?/,
        php_start: "\\\\@\\:|\\\\@=|<\\?php|<\\?=|##\\:|##=",
        php_end: "\\:\\@\\/|\\?>|\\:##",
        fncd_end: "\\^\\}|\\%\\}|\\!\\}|\\}",
        safestringS: /\{:>>>+\s/,
        safestringE: /\s+<<<:\}+($|\s|\n|\r)/
      };

      this.$rules = {
        "start": [
          { token: fncd.attribute_operator, regex: "\\[|\\]|\\|" },
          { token: fncd.attribute_operator, regex: pcre.safestringS, push: "safestring" },
          { token: fncd.attribute_operator, regex: /\{/, push: "markup" },
          { token: fncd.attribute_operator, regex: /\(/, push: "attributes" },
          { token: fncd.php, regex: pcre.php_start, push: "phpContext" },
          { defaultToken: fncd.node }
        ],
        "safestring": [
          { token: fncd.content, regex: "\\{|\\\\\\{|\\\\\\}|\\}" },
          { token: fncd.node, regex: /([a-zA-Z]|[\!_\-])+\/\/+(\b|\@)/, push: "microdown" },
          { token: fncd.php, regex: pcre.php_start, push: "phpContext" },
          { token: fncd.attribute_operator, regex: pcre.safestringE, next: "pop" },
          { defaultToken: fncd.content }
        ],
        "attributes": [
          { token: fncd.attribute, regex: pcre.attributes, next: "attributes" },
          { regex: /\,|\'|\"/, token: fncd.attribute_operator, next: "attributes" },
          { token: fncd.php, regex: pcre.php_start, push: "phpContext" },
          { token: fncd.attribute_operator, regex: /\)/, next: "pop" },
          { defaultToken: fncd.attribute }
        ],
        "markup": [
          { token: fncd.content, regex: "\\{|\\\\\\{|\\\\\\}", next: "markup" },
          { token: fncd.node, regex: /([a-zA-Z]|[\!_\-])+\/\/+(\b|\@)/, push: "microdown" },
          { token: fncd.php, regex: pcre.php_start, push: "phpContext" },
          { token: fncd.attribute_operator, regex: pcre.fncd_end, next: "pop" },
          { defaultToken: fncd.content }
        ],
        "microdown": [
          { token: fncd.microdown, regex: /[\S\b]+\/\//, next: "microdown" },
          { token: fncd.microdown, regex: "\\\\\\+|\\/\\/", next: "microdown" },
          /*{ token: fncd.php, regex: pcre.php_start, push: "phpContext" },*/
          { token: fncd.node, regex: "\\+", next: "pop" },
          { defaultToken: fncd.microdown }
        ],
        "phpContext": [
          { regex: /(?:#|\/\/)(?:[^?]|\?[^>])*/, token : "comment" },
          { token: "comment", regex: "\\/\\*", next: "comment" }, /* multi line comment */
          { token: "string", regex : '"', next : "qqstring" }, /* " string start */
          { token: "string", regex : "'", next : "qstring" }, /* ' string start */
          { token: "constant.numeric", regex : "0[xX][0-9a-fA-F]+\\b" }, /* hex */
          { token: "constant.numeric", regex : "[0-9]" }, /* integers */
          { token: "storage.type", regex :/(?:true|false|null|use|self|static|parent|final|abstract|private|public|protected|var|namespace|interface|trait|class|const|function|extends|implements)\b/ },
          { token: "storage.modifier", regex : /(?:__halt_compiler|and|array|as|break|callable|case|catch|clone|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|finally|fn|for|foreach|global|goto|if|include|include_once|insteadof|isset|list|or|print|require|require_once|return|switch|stdClass|throw|try|unset|while|xor|yield|yield from)\b/ },
          { token: "variable.language", regex : /(?:int|float|bool|string|real|mixed|object|iterable|__CLASS__|__DIR__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|__NAMESPACE__)\b/ },
          { token: "variable.other", regex : /\$[\w\d]+/ },
          { token : ["keyword", "text", "support.class"], regex : "\\b(new)(\\s+)(\\w+)" },
          { onMatch : function(value, currentSate, state) {
              value = value.substr(3);
              if (value[0] == "'" || value[0] == '"')
                  value = value.slice(1, -1);
              state.unshift(this.next, value);
              return "markup.list";
            }, regex : /<<<(?:\w+|'\w+'|"\w+")$/, next: "heredoc"
          },
          { token: "keyword.operator", regex: pcre.phpOperators },
          { token: "punctuation.operator", regex : /[,;]/ },
          { token: fncd.php, regex: pcre.php_end, next: "pop" }
        ],
        "heredoc": [
          { onMatch : function(value, currentSate, stack) {
              if (stack[1] != value)
                  return "string";
              stack.shift();
              stack.shift();
              return "markup.list";
            }, regex: "^\\w+(?=;?$)", next: "phpContext"
          },
          { token: "string", regex : ".*" }
        ],
        "comment": [
          { token: "comment", regex : "\\*\\/", next : "phpContext" },
          { defaultToken: "comment" }
        ],
        "qqstring": [
          { token: "variable", regex : pcre.qqstring },
          { token: "string", regex : '"', next : "phpContext"},
          { defaultToken : "string"}
        ],
        "qstring": [
          {token: "constant.language.escape", regex : /\\['\\]/},
          {token: "string", regex : "'", next : "phpContext"},
          {defaultToken: "string"}
        ]
      };

      this.normalizeRules();

    };

  oop.inherits(FuncdownHighlightRules, TextHighlightRules);
  exports.FuncdownHighlightRules = FuncdownHighlightRules;

  var FoldMode = require("./folding/coffee").FoldMode;

  var Mode = function() {
    this.foldingRules = new FoldMode();
    this.HighlightRules = FuncdownHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
  };
  oop.inherits(Mode, TextMode);

  (function() {
    this.$indentWithTabs = true;
    this.$id = "ace/mode/funcdown";
  }).call(Mode.prototype);
  exports.Mode = Mode;

});

(function() {
  ace.require(["ace/mode/funcdown"], function(m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
  }});
})();