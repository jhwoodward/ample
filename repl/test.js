var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  's1p1': '48, ^///',
  'part1': 's1p1 s1p1 s1p1 ',
  's1p2': '48, ^//',
  'part2': 's1p2 s1p2 s1p2 s1p2 ',
  's1p3': '24, ^///',
  'part3': 's1p3 s1p3 s1p3 s1p3 s1p3 s1p3 '
};

var parts = [
  'part1',
  'part2',
  'part3'
];

make({ name: 'test', parts: parts }, rules).play();
