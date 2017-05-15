var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var eventType = require('../constants').eventType;

function MasterMarkerParser() {
  this.type = 'MasterMarker';
  this.master = true;
  this.test = /^\$\w+/;
}

var prototype = {
  parse: function (s) {
    var markerName = s.replace('$','');
    return markerName;
  },
  mutateState: function (state, interpreter) {
    state.marker = this.parsed;
  }, 
  getEvents: function (state) {
    return [
      {
        tick: state.time.tick,
        type: eventType.marker,
        marker: this.parsed,
        origin: this.origin //ref to string position
      }
    ];
  },
  next:function(next) {
    delete next.marker;
  }

}
MasterMarkerParser.prototype = _.extend({}, parser, prototype);
module.exports = MasterMarkerParser;