var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'part1': '1:cDEFGA-B',
  'part2': '[-3:+C] 1:cD~EF~GA-B',
  'part3': '6,part2',
  'part': '1:cDEFG',
  'player1': 'part1',
  'player2': 'part2'
};

var players = [
  {
    'part': 'player1',
    'channel': 1
  },
  {
    'part': 'player2',
    'channel': 2
  }
];

make({ name: 'violin', players: players }, rules).play();
