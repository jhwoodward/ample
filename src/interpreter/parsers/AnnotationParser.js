var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;

function AnnotationParser(macros) {
  this.type = 'Annotation';
  this.test = /^{\w+}/;

  if (macros) {
    this.annotations = macros.reduce(function (acc, item) {
      if (item.type === macroType.annotation) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }

}

var prototype = {
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.annotations && this.annotations[key]) {
      return this.annotations[key];
    }
  },
  mutateState: function (state) {
    if (this.parsed.parsed) {
       this.parsed = this.parsed.parsed;
       this.key = this.parsed.key;
    }
    state.phrase = this;
    this.parsed.forEach(parser => {
      parser.mutateState(state);
    });
  },
  getEvents: function(state, prev) {
    return this.parsed.reduce(function(acc, parser) {
      if (!parser.getEvents) return acc;
      acc = acc.concat(parser.getEvents(state, prev));
      return acc;
    },[]);
  }
}

AnnotationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnnotationParser;