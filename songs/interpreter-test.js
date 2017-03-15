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
  part1: 'abcdefg',
  part2: 'cCcCcC'
};

players.violin1.part = '48,0: aBCEFG {loop(abc,3)}   ';
players.violin2.part = '48,1: aBCEFG';
players.viola.part = '24,0: gABCbcg';
players.cello.part = '48,-1: aBCEFG^';
//players.piano1.part = '12,cDEFGfedc^';

seq.load(players);
