var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var macroType = require('../constants').macroType;


function AnimationParser(macros) {
  this.type = 'Animation';
  this.test = /^\<\w+|^\w+\>/;

  if (macros) {
    this.animations = macros.reduce(function (acc, item) {
      if (item.type === macroType.animation) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  } else {
    this.animations = {};
  }
}

var prototype = {
  parse: function (s) {
    var isStart = s.indexOf('<') === 0;
    var isEnd = s.indexOf('>') === s.length-1;
    var key = s.replace('<','').replace('>','');
    if (!this.animations[key]) return false;
    return {
      key,
      start: isStart,
      end: isEnd
    }
  },
  mutateState: function (state) {
    state.animation = this.parsed;
  },
  next:function(next) {
    delete next.animation;
  }

}
AnimationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnimationParser;