var seq = require('../src/sequencer');
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var scale = require('../src/rudiments').scale;
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.triobrozfried;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);
//utils.addPlayer(players, instruments.piano, 'piano1',5);
///utils.addPlayer(players, instruments.piano, 'piano2',5);

players.violin1.substitutions = {
  part1: '48,-1:cEGe (part2)',
  part2: '12,0:FACa'
};


//NB - triobroz neg pitchbend does accent !

players.violin1.part ='';// `48,1:  (>c_DE_d)*3 (1:24,c~DE_FG_fe_d)*8 ^`;
players.violin2.part ='';// `48,1: -3@ (>c_DE_d)*3 (1:24,c~DE_FG_fe_d)*8 ^`;
players.viola.part ='';// `48,1: -7@ (>c_DE_d)*3 (1:24,c~DE_FG_fe_d)*8 ^`;
players.cello.part = `48,-2:  (-1:48,G_f_e//^dc 16,g_A~B_C_D~E/^//)*2 {spiccato} dcGe {legato} b~+a//// `;
//players.piano1.part = '12,cDEFGfedc^';

seq.load(players);
