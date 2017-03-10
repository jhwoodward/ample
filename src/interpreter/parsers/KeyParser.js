var _ = require('lodash');

function KeyParser() {
  this.type = 'Key';
  this.test = /^K\((?:[+-][A-G])+\)K/;
}
KeyParser.prototype = {
  parse: function (s) {
    return { key: utils.getNotes(s) };
  },
  mutateState: function (state) {
    state.key.flats = this.parsed.key.filter(n => n.flat);
    state.key.sharps = this.parsed.key.filter(n => n.sharp);
  }
}

module.exports = KeyParser;