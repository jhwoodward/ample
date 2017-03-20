var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');


function MarkerParser() {
  this.type = 'Marker';
  this.test = /^\$\w+/;
}

var prototype = {
  parse: function (s) {
    var markerName = s.replace('$','');
    return markerName;
  },
  mutateState: function (state) {
    if (state.isMaster) {
      state.marker = this.parsed;
    } 
  },
  leave: function(state,next) {
    delete next.marker;
  }

}
MarkerParser.prototype = _.extend({}, parser, prototype);
module.exports = MarkerParser;