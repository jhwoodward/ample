var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');


function MarkerParser() {
  this.type = 'MasterMarker';
  this.test = /^\$\w+/;
}

var prototype = {
  parse: function (s) {
    var markerName = s.replace('$','');
    return markerName;
  },
  mutateState: function (state, interpreter) {
    if (interpreter.isMaster) {
      state.marker = this.parsed;
    } 
  },
  next:function(next) {
    delete next.marker;
  }

}
MarkerParser.prototype = _.extend({}, parser, prototype);
module.exports = MarkerParser;