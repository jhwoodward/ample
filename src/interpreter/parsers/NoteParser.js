var utils = require('./utils');

function NoteParser() {
  this.type = 'note';
  this.test =  /^[>'~_]?\!*\+?\-?\=?[a-gA-G]/;
}
NoteParser.prototype = {
  parse: function (s) {
    var acc = /[+-=]/.exec(s) ? /[+-=]/.exec(s)[0] : false;
    var out = {
      char: /[a-gA-G]/.exec(s)[0],
      flat: acc === '-',
      sharp: acc === '+',
      natural: acc === '=',
    };
    Object.assign(out, utils.parseArtic(s), utils.parsePitch(s));
    return utils.strip(out);
  },
  process: function (state) {
    state.pitch.char = this.parsed.char;
    if (this.parsed.flat) {
      state.pitch.accidental = -1;
    }
    if (this.parsed.sharp) {
      state.pitch.accidental = 1;
    }
    state.pitch.natural = this.parsed.natural

  }
}

module.exports = NoteParser;