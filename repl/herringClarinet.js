var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'part1': '24,2:  {legato} 20=C11  cDEF {staccato8} Gfed  {legato} 127=C11 cEdG-Ba {staccato8} gf \n    12,  eFGA 48, {legato} -B/a\n    12, {staccato8} a-BCD \n    48, {detached} -E/ {detached} dc-ba {staccato} gf/^\n    '
};

var players = [
  {
    'part': 'part1',
    'channel': 0,
    'annotations': {
      'legato': '[-2:C] -7=ON 5=OFF ',
      'detached': '[-2:C] 0=ON -5=OFF',
      'staccato': '[-2:D]  120=VP',
      'staccato8': '[-2:D] 20=VP 127=CP11'
    },
    'config': {
      'defaultExpression': {
        'velocity': 40,
        'dynamics': 10
      }
    }
  },
  {
    'part': 'part2',
    'channel': 1,
    'annotations': {
      'legato': '[-2:C] -7=ON 5=OFF ',
      'detached': '[-2:C] 0=ON -5=OFF',
      'staccato': '[-2:D]  120=VP',
      'staccato8': '[-2:D] 20=VP 127=CP11'
    },
    'config': {
      'defaultExpression': {
        'velocity': 40,
        'dynamics': 10
      }
    }
  },
  {
    'part': 'part3',
    'channel': 2,
    'annotations': {
      'legato': '[-2:C] -7=ON 5=OFF ',
      'detached': '[-2:C] 0=ON -5=OFF',
      'staccato': '[-2:D]  120=VP',
      'staccato8': '[-2:D] 20=VP 127=CP11'
    },
    'config': {
      'defaultExpression': {
        'velocity': 40,
        'dynamics': 10
      }
    }
  }
];

make({ name: 'demo', players: players }, rules).play();
