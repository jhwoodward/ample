var _ = require('lodash');
var parser = require('./_parser');

function AnnotationParser() {
  this.type = 'Annotation';
  this.test = /^{\w+}/;
}

var prototype = {
  parse: function (s) {
    return {
      id: /\w+/.exec(s)[0]
    };
  },
  mutateState: function (state, annotations) {
    if (annotations[this.parsed.id]) {
      state.phrase = _.merge({}, annotations.default, annotations[this.parsed.id]);
      state.phrase.name = this.parsed.id;
    }
  }
}

AnnotationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnnotationParser;