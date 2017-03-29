var Sequencer = require('../src/sequencer/Sequencer');
var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

/*
https://en.wikipedia.org/wiki/Thirty-two-bar_form
- chords from gershwin's i got rhythm
- bach-fugue-like strings... thrown down quickly using transpose, that the arrangement is awful is to be expected
*/
var substitutions = {
  chordsA: `     96,  Gmaj    /        /  Bmin      /         /         
                      Cmaj    /        /  Gmaj      /         /
                      Cmaj    /  Cmin  /  Gmaj      /   Emin  /          
                      Amin    /  Dmaj  /  Gmaj      /         /
  `,
  chordsB: `     96,  Gmaj    /        /   Amin     /         /          
                      Emin    /        /   Amin     /   Dmaj  /
                      Gmaj    /        /   F#min    /         /          
                      Bmin    /        /   Amin     /   D7  /
  `};

var master = `120=T  $A (chordsA) $A (chordsA) $B (chordsB) $A (chordsA)   `;

players.violin1.part = `
  $A1( (48,1: D_F 24, -B_DD_-b)*8  )
  $A2( (24,1: d_EG_d  48,g_e)*8  )
  $B(  (24,1: {spiccato} e_Gc_Eb_gDaCEGAbdbC )*4   )
  $A3( (48,1: -bD 24, FAge)*7 48,1: {spiccato} -b  FA// ^ )
`;

players.violin2.part = `
  $A1( (48,1: {constraint:player1} F_b 24, F_bb_F)*8  ) 
  $A2( (24,1: b_ag_A  48,a_C)*8  )
  $B( {spiccato} (24,1: ^cDE )*16   )
  $A3( (48,1: ge 24, eccE)*7 48,1: g  gg//   )
`;

players.viola.part = `
3@
  $A1( (24,0: d_>E_>G_d  48,>g_e)*8  )
  $A2( (48,0: >-b_D 24, >F_Ag_e)*8  )
  $B( {spiccato} (24,0: ^cD>E )*16   )
  $A3( (24,0: {default} >d~E {spiccato}  Gd  48,ge)*7   24,0:d/gA 48,B/ )
`;

players.cello.part = `
-31@
  $A1( (24,1: dEGd  48,g^)*8  )
  $A2( (48,1: >-b_D 24, F_Ag_e)*8  )
  $B( {spiccato}(48,1: cGcG)*8  )
  $A3( (24,1: dEGd  48,ge)*7  24,1: d/EF  48,G/ )
`;

players.violin1.master = master;
players.violin1.substitutions = substitutions;
players.violin2.master = master;
players.violin2.constraints = [{
  type: 'pitch',
  player: 'violin1',
  allowIntervals: [-3, -5, -7 -9]
}];
players.violin2.substitutions = substitutions;
players.viola.master = master;
players.viola.substitutions = substitutions;
players.cello.master = master;
players.cello.substitutions = substitutions;

var seq = new Sequencer();
seq.load([players.violin1]);
seq.start();


//module.exports = players;
