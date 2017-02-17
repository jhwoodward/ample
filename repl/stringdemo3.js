var make = require('../src/ample').make;
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var ensembles = require("../src/ensembles");
var instruments = require("../src/instruments/all");
var loop = utils.loop;


var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.individual;

var players = utils.playersFromEnsemble(ensemble, performer)
players = utils.addPlayer(players,instruments.woodwind.clarinet.performers.herring);


console.log(players);
var rules = {
  'p1a': '1:24, {spiccato}  eGeGeGeG  fGfGfGfG eGeGeGeG {pizzicato} fGfGfGfG eGeGeGeG  fGfGfGfG  ',
  'p2a': '1:24, {spiccato}  cbCbCbCb  DcDcDcDc cbCbCbCb {pizzicato}  DcDcDcDc cbCbCbCb  DcDcDcDc',
  'p3a': '0:36, {spiccato}  gAB gAB gAB gAB  gAB gAB gAB gAB  gAB gAB gAB gAB  gAB gAB gAB gAB',
  'p4a': '-1:48,{spiccato}  C/G/    C/G/    -1:C/G/    C/G/  -1:  C/G/  C/G/   -1: C/G/ C/G/ ^',
  'part1': 'p1a p1a p1a p1a p1a',
  'part2': 'p2a p2a p2a p2a p2a',
  'part3': 'p3a p3a p3a p3a p3a',
  'part4': 'p4a p4a p4a p4a p4a',
  //'part5': '48, //// //// //// //// 1:G/// 18, eDFGd//c//g////////6,fe-edca-ad/c/-b/a//24, GC//DE//G-B///12,ag//eD///c//^',
  'part5': '48, 40=C11 //// //// 1:G/// 18, eDFGd//c//g////////6,fe-edca-ad/c/-b/a//24, GC//DE//G-B///12,ag//eD///c//^'
};

var conductor = {
  28: key.fsharp,
  56: key.aflat,
  84: key.dflat,
  112: key.cmaj
};

utils.addRudiments(rules);






make({ name: 'stringdemo2', players: players }, rules, conductor).play();
