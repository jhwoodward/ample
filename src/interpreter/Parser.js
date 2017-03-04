
var parsers = require('./parsers/parsers');

function Parser() {
};

Parser.prototype = {
  test: function (part) {
    var result, parser;
    for (var i = 0; i < parsers.length; i++) {
      parser = new parsers[i]();
      result = parser.match(part);
      if (result) {
        break;
      }
    }
    if (!result) return undefined;
    return parser;
  },
  parse: function (part) {
    var parsers = [], parser;
    var cursor = 0;
    while (part.length && parsers.length < 10000) {
      parser = this.test(part);
      if (parser) {
        parsers.push(parser);
        part = part.substring(parser.string.length, part.length);
      } else {
        parsers.push(null);
        part = part.substring(1, part.length)
      }
    }
    return parsers.filter(a => !!a);
  }
}

module.exports = Parser;
