var seq = require('../src/sequencer');
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var scale = require('../src/rudiments').scale;
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);
//utils.addPlayer(players, instruments.piano, 'piano1',5);
///utils.addPlayer(players, instruments.piano, 'piano2',5);

players.violin1.substitutions = {
  part1: '48,-1:cEGe (part2)',
  part2: '12,2:FACa'
};

players.violin1.part = `48,0: 

(

  48,0:aBC 
  (
    -2:cgCg(part2)
  )*3 
  
  )*8  ^  

 `;
players.violin2.part = '';
players.viola.part = '';
players.cello.part = '';
//players.piano1.part = '12,cDEFGfedc^';

seq.load(players);
