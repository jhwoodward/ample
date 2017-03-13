var _ = require('lodash');
var parser = require('./_parser');

function MacroParser(macros) {
  this.type = 'Macro';
  this.test = /^{\w+}/;
}

var prototype = {
  parse: function (s) {
    return {
      id: /\w+/.exec(s)[0]
    };
  },
  mutateState: function (state, macros) {
    if (Macros[this.parsed.id]) {
      state.phrase = _.merge({}, Macros.default, Macros[this.parsed.id]);
      state.phrase.name = this.parsed.id;
    }
  }
}

MacroParser.prototype = _.extend({}, parser, prototype);
module.exports = MacroParser;