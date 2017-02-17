var make = require('../src/ample').make;
var utils = require('../src/utils');
var rudiments = require('../src/rudiments');
var ensembles = require("../src/ensembles");
var loop = utils.loop;


var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.playable;
console.log(performer)
var players = utils.playersFromEnsemble(ensemble, performer);


var rules = {
  'p1a': '1:48,  C//_~b  ////    ////    ////    ////  ////    ///^',
  'p2a': '0:48,  E///    ////    ////    /_~dcb  a///  ////    ///^',
  'p3a': '0:48,  G///    ////    //_~f/  ////    ////  ////    //^',
  'p4a': '-1:48, C///    //_~G/  ////    ////    //f/  d/_~g/  //^',
  'part1': 'p1a p1a p1a p1a p1a',
  'part2': 'p2a p2a p2a p2a p2a',
  'part3': 'p3a p3a p3a p3a p3a',
  'part4': 'p4a p4a p4a p4a p4a'
};

var conductor = {
  '28': 'K(+f+c+g+d+a+e)K',
  '56': 'K(-b-e-a-d)K',
  '84': 'K(-b-e-a-d-g)K',
  '112': 'K()K'
};

utils.addRudiments(rules);






make({ name: 'stringdemo2', players: players }, rules, conductor).play();
