var _ = require('lodash');

function AnnotationParser() {
  this.type = 'Annotation';
  this.test = /^{\w+}/;
}
AnnotationParser.prototype = {
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

module.exports = AnnotationParser;