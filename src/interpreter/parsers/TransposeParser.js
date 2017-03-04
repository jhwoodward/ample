var utils = require('./utils');

function TransposeParser() {
  this.type = 'transpose';
  this.test = /^-?[\d]{1,3}@/;
}
TransposeParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  process: function (state) {
    
  }
}

module.exports = TransposeParser;