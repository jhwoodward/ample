var utils = require('./utils');

function TempoParser() {
  this.type = 'Tempo';
  this.test = /^[\d]{1,3}=T/;
}
TempoParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  process: function (state) {
    
  }
}

module.exports = TempoParser;