
/*
  Returns the first parser who's regex matchs the part string
*/
function findMatch(parsers, part, macros) {
  var result, parser;
  for (var i = 0; i < parsers.length; i++) {
    parser = new parsers[i](macros);
    result = parser.match(part);
    if (result) {
      break;
    }
  }
  if (!result) return undefined;
  return parser;
}


/*
Returns an array of parsers who's regex's match the part string
*/
const parse = (parsers, part, macros, cursor) => {
  var out = [], parser;
  var cursor = cursor || 0;
  while (part.length && out.length < 9999999) {
    parser = findMatch(parsers, part, macros);
    if (parser) {
      //reference to position in string
      parser.origin = {
        start: cursor,
        end: cursor + parser.string.length
      };
      out.push(parser);
      part = part.substring(parser.string.length, part.length);
      cursor += parser.string.length;
    } else {
      cursor ++;
      out.push(null);
      part = part.substring(1, part.length)
    }
  }
  return out.filter(a => !!a);
}

module.exports = parse;
