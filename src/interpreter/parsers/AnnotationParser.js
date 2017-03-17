var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;

function AnnotationParser(macros) {
  this.type = 'Annotation';
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
    var key = /\w+/.exec(s)[0];
    if (this.annotations[key]) {
      return key;
    }
  },
  mutateState: function (state) {
    state.phrase = _.merge({}, this.annotations[this.parsed]);
    state.phrase.name = this.parsed;
  }
}

AnnotationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnnotationParser;