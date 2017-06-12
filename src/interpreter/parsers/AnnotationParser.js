var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;

function AnnotationParser(macros) {
  this.type = 'Annotation';
  //this.test = /^{\w+}/;
  this.dynamic = true;
  this.test = /^{\w+}(?!( ?)=)/;
  if (macros) {
    this.annotations = macros.reduce(function (acc, item) {
      if (item.type === macroType.annotation) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
    
  } else {
    this.annotations = {};
  }
}

var prototype = {
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.annotations && this.annotations[key]) {
      return _.cloneDeep(this.annotations[key]);
    }
  },
  mutateState: function (state) {
    if (!this.isArticulation) {
      state.phrase = this;
    }
    this.parsed.parsed.forEach(parser => {
      parser.mutateState(state);
    });
  },
  waitForNote: true,
 // continue:true,
  getEvents: function(state, prev) {
    var out = this.parsed.parsed.reduce(function(acc, parser) {
      if (!parser.getEvents) return acc;
      acc = acc.concat(parser.getEvents(state, prev));
      return acc;
    },[]);
    out.forEach(e => {
      e.annotation = this.parsed.key;
     });
    return out;
  },
  merge: function(articulations){
    
    var out = new AnnotationParser();
    out.parsed = {
      key: this.parsed.key,
      parsed: []
    }
    this.parsed.parsed.forEach(p => {
      out.parsed.parsed.push(p);
    });
    articulations.forEach(a => {
      out.append(a.parsed, a.key);
    });
    out.info = articulations.map(a => a.key).join(', ');
    out.isArticulation = true;
    return out;
    
  },
  append: function(parsers, key) {
    var replace = [];
    this.parsed.parsed.forEach((p,i) => {
      parsers.forEach(pnew => {
        if (p.compare && p.compare(pnew)) {
          this.parsed.parsed.splice(i,1);
        }
      });
    });
    this.parsed.parsed = this.parsed.parsed.concat(parsers);
    this.parsed.key += ' - ' + key;
  }
}

AnnotationParser.prototype = _.extend({}, parser, prototype);
module.exports = AnnotationParser;