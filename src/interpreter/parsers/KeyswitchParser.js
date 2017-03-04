var utils = require('./utils');

function KeyswitchParser() {
  this.type = 'Keyswitch';
  this.test = /^\[\-?[0-4]:[+-]?[A-G]\]/;
}
KeyswitchParser.prototype = {
  parse: function (s) {
    var note = /[+-]?[A-G]/.exec(s)[0];
    return Object.assign(utils.parseNote(note), utils.parseOctave(s));
  },
  process: function (state) {
    
  }
}

module.exports = KeyswitchParser;