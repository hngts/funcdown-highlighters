-- Copyright 2025 Tux.Lector (https://hngts.com/?mkp=fncd).
-- Funcdown LPeg lexer.

local lexer = lexer
local P, S = lpeg.P, lpeg.S
local C, Cmt = lpeg.C, lpeg.Cmt
local lex = lexer.new(...)

-- Tags, so to speak ...
lex:add_rule('keyword', lex:tag(lexer.KEYWORD, lex:word_match(lexer.KEYWORD)))

-- Funcdown String wrappers
local _space = lexer.space
local _sstart = '{:>>>'
local _ssend = '<<<:}'
--
lex:add_rule('string', lex:tag(lexer.STRING, lexer.range(
(_sstart * _space), (_space * _ssend * _space), false, true, false) 
+ lexer.range('{', '}', false, true, false)))

-- Funcdown Attribute wrappers
lex:add_rule('attribute', lex:tag(lexer.ATTRIBUTE, lexer.range('(', ')', false, true, false)))

-- Funcdown Operators
lex:add_rule('operator', lex:tag(lexer.OPERATOR, S('\'+[(!,@)|*{:}]~"/')))

-- Embeded php (implementation of php in fncd is very poor looking) 
local php = lexer.load('php')
local start = lex:tag(lexer.PREPROCESSOR, 
  '{{' * (':' * lexer.space)^-1) + lex:tag(lexer.PREPROCESSOR, 
  '<?' * ('php' * lexer.space)^-1)
local _end_ = lex:tag(lexer.PREPROCESSOR, ':}}') + lex:tag(lexer.PREPROCESSOR, '?>') 
lex:embed(php, start, _end_)

-- Tag list
lex:set_word_list(lexer.KEYWORD, {
  'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'body',
  'button', 'canvas', 'caption', 'cite', 'code', 'colgroup', 'content', 'data', 'datalist', 'dd',
  'decorator', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'element', 'em', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
  'html', 'i', 'iframe', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'menu',
  'menuitem', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p',
  'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow',
  'small', 'spacer', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'var', 'video',
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta',
  'param', 'source', 'track', 'wbr', 'D', 'F', 'M', 'A', 'J', 'L', 'P', 'C', 'I', 'AS'
})

-- Fold everywhere expected
lex:add_fold_point(lexer.STRING, '{', '}')
lex:add_fold_point(lexer.ATTRIBUTE, '(', ')')
lex:add_fold_point(lexer.OPERATOR, '[', ']')
lex:add_fold_point(lexer.PREPROCESSOR, '<?', '?>')

-- That's it!
return lex
