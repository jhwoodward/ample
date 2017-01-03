var make = require('../src/realtime').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'phrase1': `2:24,c/E>G/A>g/`,
  'phrase2': '-1:48,>CgC',
  'phrase2b': '-1:48,>Cg^',
  'phrase3': '0:12,e//A///ed',
  'part1': '0@ phrase1 24@ phrase2',
  'player1': `part1 part1 part1 part1 
            part1 part1 part1 part1 
            part1 part1 part1 part1 
            part1 part1 part1 `,
  'part2': 'phrase2 phrase2b',
  'player2': `part2 part2 part2 part2 
              part2 part2 part2 part2 
              part2 part2 part2 part2 
              part2 part2 part2 part2 
              part2  `,
  'part3': 'phrase3 phrase2',
  'player3': `part3 part3 part3 part3 
              part3 part3 part3 part3 
              part3 part3 part3 part3 
              part3 part3 part3 part3 
            part3 part3 part3 part3 part3 `
};

var players = [
  { part: 'player1', channel: 1},
  { part: 'player2', channel: 3},
  { part: 'player3', channel: 3}
];

var conductor = {
  0: 'S(CEG)S',
  16: '5@ S(D+FAC)S',
 32: 'S(F-ACD)S',
  42: '0@ S(CEG)S', 
  60: 'S(C-EG-B)S',
  72: 'S(F-ACD)S',
   84: '0@ S(CEG)S',
   96: '5@ S(D+FAC)S',
   100: '12@ S(F-ACD)S',
   102:'S(CEG)S'
}

var parts = make({ name: 'john', players: players }, rules, conductor).play();

