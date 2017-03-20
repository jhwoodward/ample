var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var key = require('./_key');

function KeyParser() {
  this.type = 'Key';
 // this.test = /^K\((?:[+-][A-G])+\)K/;
  this.test = /^K\([A-G](b|#)?(min)?\)K/;
}


var prototype = {
  parse: function (s) {
    var keyName = s.replace('K(','').replace(')K','');
    if (!key[keyName]) return false;
    return utils.parseNotes(key[keyName]);
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