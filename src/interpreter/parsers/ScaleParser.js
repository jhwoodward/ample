var utils = require('./utils');

function ScaleParser() {
  this.type = 'Scale';
  this.test = /^S\((?:[+-]?[A-G])+\)S/;
}
ScaleParser.prototype = {
  parse: function (s) {
    return { scale: utils.parseNotes(s) };
  },
  process: function (state) {
    
  }
}

module.exports = ScaleParser;