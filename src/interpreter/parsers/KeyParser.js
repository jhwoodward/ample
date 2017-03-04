
function KeyParser() {
  this.type = 'Key';
  this.test = /^K\((?:[+-][A-G])+\)K/;
}
KeyParser.prototype = {
  parse: function (s) {
    return { key: utils.getNotes(s) };
  },
  process: function (state) {
    state.key.flats = this.parsed.key.filter(n => n.flat);
    state.key.sharps = this.parsed.key.filter(n => n.sharp);
  }
}

module.exports = KeyParser;