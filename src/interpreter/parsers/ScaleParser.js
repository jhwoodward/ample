var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function ScaleParser() {
  this.type = 'Scale';
  this.test = /^S\((?:[+-]?[A-G])+\)S/;
}
var prototype = {
  parse: function (s) {
    return utils.parseNotes(s);
  },
  mutateState: function (state) {
    state.scale = this.parsed;
  }
}

ScaleParser.prototype = _.extend({}, parser, prototype);
module.exports = ScaleParser;