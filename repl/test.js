var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'part1': 'cDEF',
  'part2': 'part1 part1 part1',
  'part3': '6,part2'
};

var parts = [
  'part1',
  'part2',
  'part3'
];


make({ name: 'test', parts: parts }, rules).play();
