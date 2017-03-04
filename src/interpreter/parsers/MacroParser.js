
function MacroParser() {
  this.type = 'macro';
  this.test = /^{\w+}/;
}
MacroParser.prototype = {
  parse: function (s) {
    return {
      id: /\w+/.exec(s)[0]
    };
  },
  process: function (state) {
    
  }
}

module.exports = MacroParser;