
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

var rules = {
  v1a: '  >e F  ', 
  v1b: ' cD  ', 
  v1c: '  BC^///DE^',
  v1d: '  Fd/+FGAg',
  v1e: ' 48,v1a 24,v1b 48,v1a 0:24, v1c v1f',
  v1f: ' 24,v1b v1d 1: 24,v1b  v1d  v1e',
  violin1: '{pizzicato} 0:24, v1e v1f ^', 
  violin2:'v1b 0:  48,v1a v1d 0: 3@ v1a 24,v1c v1e 0@ v1f',

  c1a: '-1:24, cE^/G',
  c1b: '-1:48, g^//',
  c1c: '-1:48, /24,aB^',
  c1d: '-1:48, ////',
  c1e: 'c1a c1b v1c c1a c1c c1f',
  c1f: 'c1b c1d c1b v1a v1b v1a c1d c1e',
  cello: '{pizzicato} c1e c1f ^',

  p1e: '12, v1a 24,v1b 12,v1a 0: v1c v1f',
  p1f: '12, v1b {pedaldown} v1d 48, 1: v1b 24, v1d {pedalup} v1e',
  piano1: '0: 12, p1e p1f',
  piano2: '3@ 12, p1f p1e '
};

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
  conductor: conductor
};
