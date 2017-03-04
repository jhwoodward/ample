
function SustainParser() {
  this.type = 'sustain';
  this.test = /^\//;
}
SustainParser.prototype = {
  parse: function (s) {
    return {sustain: true};
  },
  process: function (state) {
    
  }
}

module.exports = SustainParser;