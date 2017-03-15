var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;

function MacroParser(macros) {
  this.type = 'Macro';
  this.test = /^{\w+}/;

  if (macros) {
    this.annotations = macros.reduce(function (acc, item) {
      if (item.type === macroType.annotation) { 
        acc[item.key] = item.parsed; 
      }
      return acc;
    }, {});
  }

}

var prototype = {
  parse: function (s) {
    return {
      id: /\w+/.exec(s)[0]
    };
  },
  mutateState: function (state) {
    if (this.annotations[this.parsed.id]) {
      state.phrase = _.merge({}, this.annotations[this.parsed.id]);
      state.phrase.name = this.parsed.id;
    }
  }
}

MacroParser.prototype = _.extend({}, parser, prototype);
module.exports = MacroParser;