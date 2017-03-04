function PitchbendParser() {
  this.type = 'pitchbend';
  this.test = /^[\d]{1,3}==?P/;
}
PitchbendParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  process: function (state) {
    
  }
}

module.exports = PitchbendParser;