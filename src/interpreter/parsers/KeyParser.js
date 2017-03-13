var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
function KeyParser() {
  this.type = 'Key';
  this.test = /^K\((?:[+-][A-G])+\)K/;
}
var prototype = {
  parse: function (s) {
    return utils.parseNotes(s);
  },
  mutateState: function (state) {
    state.key = {
      flats: this.parsed.filter(n => n.flat),
      sharps: this.parsed.filter(n => n.sharp)
    };
  }
}
KeyParser.prototype = _.extend({}, parser, prototype);
module.exports = KeyParser;