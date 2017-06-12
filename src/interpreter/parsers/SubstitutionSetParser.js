var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;

function SubstitutionSetParser(macros) {
  this.type = 'SubstitutionSet';
  this.test = /^\w+(\#[\d]+|\#random|\#next)?(?!( ?)=)/;
  this.dynamic = true;
  this.substitutionSets = {};
  if (macros) {
    this.substitutionSets = macros.reduce(function (acc, item) {
      if (item.type === 'substitutionset') {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }
}

var prototype = {
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.substitutionSets[key]) {
      var indexTest = /\#[\d]+/.exec(s);
      var parsed = {
        key: key
      };
      if (indexTest) {
        parsed.index = parseInt(indexTest[0].replace('#', ''), 10);
      }
      var randomTest = /\#random/.exec(s);
      if (randomTest) {
        parsed.random = true;
      }
      var nextTest = /\#next/.exec(s);
      if (nextTest) {
        parsed.next = true;
      }

      return parsed;
    }
  },
  mutateState: function (state, interpreter) {
    this.startTick = state.time.tick;

    var set = this.substitutionSets[this.parsed.key];
    var sub;

    if (this.parsed.index) {
      set.currentIndex = this.parsed.index;
      sub = set.values[this.parsed.index];
    } else if (this.parsed.random) {
      var currentIndex = Math.floor(Math.random() * set.values.length) + 1;
      sub = set.values[currentIndex];
      set.currentIndex = currentIndex;
    } else if (this.parsed.next) {
      if (!set.currentIndex) {
        set.currentIndex = 1;
      } else {
        if (set.currentIndex + 1 > set.values.length - 1) {
          set.currentIndex = 1;
        } else {
          set.currentIndex++;
        }
      }
      sub = set.values[set.currentIndex];
    } else {
      if (!set.currentIndex) {
        set.currentIndex = 1;
      }
      sub = set.values[set.currentIndex];
    }

    this.sub = sub;

    interpreter.generateState(interpreter.parse(sub.part, sub.definitionStart));

    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;
  },
  getEvents: function () {
    return [
      {
        tick: this.startTick,
        type: eventType.substitution,
        origin: this.origin, //ref to string position
        subOrigin: this.sub.origin
      },
      {
        tick: this.endTick,
        type: eventType.substitutionEnd,
        origin: this.origin,
        subOrigin: this.sub.origin
      }
    ];
  },
  continue: true
}

SubstitutionSetParser.prototype = _.extend({}, parser, prototype);
module.exports = SubstitutionSetParser;