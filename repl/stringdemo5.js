var make = require('../src/ample').make;
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var ensembles = require("../src/ensembles");
var instruments = require("../src/instruments/all");

var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(ensemble, performer, true)

var rules = {
  'p1a': '1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G  ', 
  'p2a': '1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b ', // 24 x 6 = 144... 48
  'p3a': '0:36, {spiccato} c  ', //36 x 4 = 144... 32
  'p4a': '-1:48,{spiccato} c/// //// //// D///',// 24 
  'violin1': 'p1a p1a p1a p1a p1a      p1a 0@ p1a  ^',
  'violin2': 'p2a p2a p2a p2a p2a   3@  p2a p2a  ^',
  'viola': ' p3a p3a p3a p3a p3a     p3a p3a ^',
  'cello': 'p4a p4a p4a p4a      p4b p4b p4a p4b^'
};

var conductor = {
  1: key.cmaj + ' 144=T',
  17: key.emaj, // + ' 113=T',
  29: key.dmaj,// + ' 153=T',
  32: key.aflat,
  48: key.dflat,
  64: key.cmaj,
  97: key.dflat,
  121: key.cmaj,
  129: key.cmaj
};

utils.addRudiments(rules);

//make({ name: 'stringdemo2', players: players }, rules, conductor).play();

module.exports = {
  players: players,
  rules: rules,
  conductor: conductor
};
