var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var scale = require('../src/rudiments').scale;
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var stringQuartet = ensemble.stringQuartet;
var performer = ensemble.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(stringQuartet, performer, true);
utils.addPlayer(players, instruments.piano, 'piano1');
utils.addPlayer(players, instruments.piano, 'piano2',5);

var hilbert = {
  hilbertstart: '1=RPS hilbert1a',
  hilbert1a : '+ hilbert1b X- hilbert1a >X hilbert1a -X hilbert1b +',
  hilbert1b : '- hilbert1a >X+ hilbert1b X hilbert1b >+X hilbert1a -',
};

var island = {//iterations 3
  islandstart: '1=RPS X',
  X: 'X+Y++>Y-X--X->Y+',
  Y: '-X+>Y++Y+X-->X-Y'
}

//these cycle out of pitch range - consider constrain pitch within limits (octave ?) and cyling around the octave
var koch = {
  kochstart: '2=RPS X',
  X: 'X-X+X+X-X'
}
var dragon = {
  dragonstart: 'X dragon1a',
  dragon1a: 'dragon1a + dragon1b X',
  dragon1b: 'X dragon1a - dragon1b'
}

var rules = {
  'violin1': ' ',
  'violin2' : '',
  'viola' : '',//
  'cello' : '',
  'piano1': '1:24, 1=RPS a hilbertstart ',
  'piano2': ''
};

Object.assign(rules, hilbert);
//Object.assign(rules, dragon);
//Object.assign(rules, island);

var conductor = {
  1: scale.cblues + ' 144=T',
  17: scale.fblues,
  25: scale.cblues,
  33: scale.gblues,
  37: scale.fblues,
  41: scale.gblues,
  45: scale.fblues,
  49: scale.gblues,
  53: scale.fblues,
  58: scale.cblues
};


utils.addRudiments(rules);

module.exports = {
  players: players,
  rules: rules,
  conductor: conductor,
  iterations: 3
};

