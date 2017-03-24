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
    if (this.annotations[key]) {
      return {
        key,
        annotation: this.annotations[key]
      }
    }
  },
  mutateState: function (state) {

    if (this.parsed.annotation.events) {
      this.parsed.annotation.events.forEach(e => {
        if (e.type === eventType.noteoff) {
          e.tick = state.time.tick -1
        } else {
          e.tick = state.time.tick -2;
        }
        e.annotation = this.parsed.key;
       
      });
      state.events = state.events.concat(this.parsed.annotation.events);
    } 

    state.phrase = _.merge({}, this.parsed.annotation.state || this.parsed.annotation);
    state.phrase.events = this.parsed.annotation.events;
    state.phrase.name = this.parsed.key;
  }
}

AnnotationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnnotationParser;