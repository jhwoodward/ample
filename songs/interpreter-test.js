var seq = require('../src/sequencer');
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var scale = require('../src/rudiments').scale;
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);
//utils.addPlayer(players, instruments.piano, 'piano1',5);
///utils.addPlayer(players, instruments.piano, 'piano2',5);

players.violin1.substitutions = {
  part1: '48,0:cEGe (part2)',
  part2: '12,0:FACa'
};



//bug moving from b-b
//bug moving from cc

//players.violin1.part =`24,1:  (24,c_D_E_F_G 1(part2) 2(part1) 3(24,e) 4(12,A_g_A_g//^/) )*4  ^`;

var master = `150=T 192, ( $A / /  $B / / $C / / )*4 `;
players.violin1.master = master;
players.violin2.master = master;
players.viola.master = master;
players.cello.master = master;

/*
players.violin1.part = [
  {
    from: 'A',
    part: '1:24,cDEd'
  },
  {
    from: 'B',
    part: '2:48,cbag'
  }

  ];
  */
players.violin1.part = `
  $A( (1:24,c_E_Gfe~dcb)*2 ^ )
  $B( (1:48,cbag)*2 ^ ) 
  `;
players.violin2.part = `
  $B( (1:48,edcD)*2 ^ )
`;



players.viola.part = '';//`48,1: -7@ (>c_DE_d)*3 (1:24,c~DE_FG_fe_d)*2 ^`;
players.cello.part = `
  $C( {pizzicato} -1:24, (cGcGcGcG)*2 )
`;

//`48,-2:  (-1:48,G_f_e//^dc 16,g_A~B_C_D~E/^//)*2 {spiccato} dcGe {legato} >b_+a///^ `;
//players.piano1.part = '12,cDEFGfedc^';

seq.load(players);
