var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var macroType = require('../constants').macroType;
var utils = require('../utils');
var parserUtils = require('../parserUtils');

function MirrorParser(macros) {
  this.type = 'Mirror';
  this.test = /^mirror|^end mirror/;

  this.substitutions = {};
  if (macros) {
    this.substitutions = macros.reduce(function (acc, item) {
      if (item.type === macroType.substitution) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }

}

var prototype = {
  parse: function (s) {
    var isStart = s.indexOf('mirror') === 0;
    var isEnd = s.indexOf('end mirror') === s.length - 7;

    var parsed = {
      start: isStart,
      end: isEnd
    }

    if (isStart) {
    //  var bracketed = parserUtils.getBracketed(s, 7);
     // var part = bracketed.trim();
    //  if (this.substitutions[part]) {
    //    parsed.part = part;
        
    //  }
    }

    return parsed;
  },
  mutateState: function (state, interpeter) {

    var modifier = {
      id: this.type,
      type: modifierType.pitch,
      order: 1,
      fn: function mirrorPitch(state) {
        var axis = 60;
        var distFromAxis = state.pitch.value - axis;
        state.pitch.value = axis - distFromAxis;
        return '';
      }
    }; 
    if (this.parsed.start) {
      utils.addModifier(state, modifier);
    } else {
      utils.removeModifier(state, modifier);
    }
   

    if (this.parsed.part) {
      var part = this.substitutions[this.parsed.part];
      interpreter.generateState(part.parsed);
    }

  }
}

MirrorParser.prototype = _.extend({}, parser, prototype);
module.exports = MirrorParser;