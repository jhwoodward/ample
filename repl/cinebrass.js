var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'part1': '24,2:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf \n    12,  eFGA 48, {legato} -B/a\n    12, {staccato8} a-BCD 127=L\n    48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^\n    '
};

var players = [
  {
    'part': 'part1',
    'channel': 0,
    'annotations': {
      'legato': '20=CP3 127=CP64 -7=ON 5=OFF',
      'detached4': '20=CP3 127=CP64 0=ON 120=VP -15=OFF',
      'detached2': '20=CP3 127=CP64  0=ON  -20=OFF',
      'staccato': '50=VP  0=CP64',
      'staccato8': '50=VP  0=CP64',
      'staccato4': '100=VP  0=CP64',
      'staccato2': '120=VP  0=CP64'
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
      'legato': '20=CP3 127=CP64 -7=ON 5=OFF',
      'detached4': '20=CP3 127=CP64 0=ON 120=VP -15=OFF',
      'detached2': '20=CP3 127=CP64  0=ON  -20=OFF',
      'staccato': '50=VP  0=CP64',
      'staccato8': '50=VP  0=CP64',
      'staccato4': '100=VP  0=CP64',
      'staccato2': '120=VP  0=CP64'
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
      'legato': '20=CP3 127=CP64 -7=ON 5=OFF',
      'detached4': '20=CP3 127=CP64 0=ON 120=VP -15=OFF',
      'detached2': '20=CP3 127=CP64  0=ON  -20=OFF',
      'staccato': '50=VP  0=CP64',
      'staccato8': '50=VP  0=CP64',
      'staccato4': '100=VP  0=CP64',
      'staccato2': '120=VP  0=CP64'
    },
    'config': {
      'defaultExpression': {
        'velocity': 40,
        'dynamics': 10
      }
    }
  }
];

make({ name: 'cinebrass', players: players }, rules).play();
