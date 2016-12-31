var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'phrase1': '1:48,cEGA',
  'phrase2': '-1:48,CgC',
  'phrase3': '0:12,eFGAgfed',
  'part1': 'phrase1 phrase2',
  'player1': 'part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 part1 ',
  'part2': 'phrase2',
  'player2': 'part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 ',
  'part3': 'phrase3 phrase2',
  'player3': 'part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 '
};

var players = [
  { part: 'player1', channel: 1},
  { part: 'player2', channel: 4},
  { part: 'player3', channel: 5}
];

make({ name: 'john', players: players }, rules).play();
