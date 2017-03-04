
function VelocityParser() {
  this.type = 'velocity';
  this.test = /^[\d]{1,3}==?V/;
}
VelocityParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  process: function (state) {
    
  }
}

module.exports = VelocityParser;