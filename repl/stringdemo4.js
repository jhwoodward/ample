var make = require('../src/ample').make;
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var ensembles = require("../src/ensembles");
var instruments = require("../src/instruments/all");

var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(ensemble, performer, true)
players = utils.addPlayer(players,instruments.woodwind.clarinet.performers.herring, 'clarinet');

var rules = {
  'p1a': '1:24, {spiccato}  eGeGeGeG  fGfGfGfG eGeGeGeG {pizzicato} fGfGfGfG eGeGeGeG  fGfGfGfG  ',
  'p2a': '1:24, {spiccato}  cbCbCbCb  DcDcDcDc cbCbCbCb {pizzicato}  DcDcDcDc cbCbCbCb  DcDcDcDc',
  'p3a': '0:36, {spiccato}  gAB gAB gAB gAB  gAB gAB gAB BCa BCa BCa BCa ',
  'p4a': '-1:48,{spiccato}  C/G/    C/G/    -1:C/G/    C/G/  -1:  C/G/  C/G/   -1: C/G/ C/G/ ',
  'violin1': 'p1a p1a p1a p1a p1a',
  'violin2': 'p2a p2a p2a p2a p2a',
  'viola': 'p3a p3a p3a p3a p3a',
  'cello': 'p4a p4a p4a p4a p4a',
  //'part5': '48, //// //// //// //// 1:G/// 18, eDFGd//c//g////////6,fe-edca-ad/c/-b/a//24, GC//DE//G-B///12,ag//eD///c//^',
  'clarinet': '48, 40=C11 //// //// 1:G/// 18, eDFGd//c//g////////6,fe-edca-ad/c/-b/a//24, GC//DE//G-B///12,ag//eD///c//^'
};

var conductor = {
  0: key.bflat,
  16: key.fsharp,
  28: key.dmaj,
  32: key.aflat,
  48: key.dflat,
  64: key.cmaj
};

utils.addRudiments(rules);

//make({ name: 'stringdemo2', players: players }, rules, conductor).play();

module.exports = {
  players: players,
  rules: rules,
  conductor: conductor
};
