var utils = require('../parserUtils');
var _ = require('lodash');

function ScaleParser() {
  this.type = 'Scale';
  this.test = /^S\((?:[+-]?[A-G])+\)S/;
}
ScaleParser.prototype = {
  parse: function (s) {
    return { scale: utils.parseNotes(s) };
  },
  mutateState: function (state) {
    state.scale = this.parsed.scale;
  }
}

module.exports = ScaleParser;