var make = require('../src/ample').make;
var utils = require('../src/utils');
var annotations = require('../src/annotations');
var loop = utils.loop;

var rules = {
  'part2': '127=L {legato} 1:12,cDEFGA-B {legato} C^^^b~C//^',
  'part3': '127=L {staccato} 0:12,cbagfed  {legato} c//^G~c//^',
  'part1': '12,1:c_D E_F {pizzicato} >Gf>ed {legato} c/////^'
};

var players = [
  {
    'part': 'part1',
    'channel': 0,
    'annotations': annotations.triobroz,
    'config': {
      'defaultExpression': {
        'dynamics': 90
      }
    }
  },
  {
    'part': 'part2',
    'channel': 1,
    'annotations': annotations.triobroz,
    'config': {
      'defaultExpression': {
        'dynamics': 90
      }
    }
  },
  {
    'part': 'part3',
    'channel': 2,
    'annotations': annotations.triobroz,
    'config': {
      'defaultExpression': {
        'dynamics': 90
      }
    }
  }
];

make({ name: 'triobroz', players: players }, rules).play();
