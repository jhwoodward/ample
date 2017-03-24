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
  chordsA: `     96,  Bb6     /  Gm7   /  Cm7    /  F7      /          
                      Dm7     /  Gm7   /  Cm7    /  F7      /
                      Fm7     /  Bb7   /  Eb6    /  Edim7   /          
                      C9      /  F7    /  Bbmaj  /  F7      /
  `,
  chordsAfinal: `96,  Bb6     /  Gm7   /  Cm7    /  F7      /          
                      Dm7     /  Gm7   /  Cm7    /  F7      /
                      Fm7     /  Bb7   /  Eb6    /  Edim7   /          
                      C9      /  F7    /  Bb6    /          /
  `,
  chordsB: `     96,  D9      /        /         /          /          
                      G7      /        /         /          /
                      C9      /        /         /          /          
                      F7      /        /         /          /
  `};

var master = `120=T  $A (chordsA) $A (chordsA) $B (chordsB) $A (chordsAfinal)   `;

players.violin1.part = `
  $A1( (48,1: D_F 24, -BDD-b)*8 ^ )
  $A2( (24,1: dEGd  48,ge)*8 ^ )
  $B(  (24,1: {spiccato} eGcEbgDaCEGAbdbC )*4 ^  )
  $A3( (48,1: -bD 24, FAge)*7 48,1: {spiccato} -b  FA// ^ )
`;

players.violin2.part = `
  $A1( (48,1: F_b 24, FbbF)*8 ^ ) 
  $A2( (24,1: bagA  48,aC)*8 ^ )
  $B( {spiccato} (24,1: ^cDE )*16  ^ )
  $A3( (48,1: ge 24, eccE)*7 48,1: g  gg//  ^ )
`;

players.viola.part = `
3@
  $A1( (24,0: d_>E_>G_d  48,>g_e)*8 ^ )
  $A2( (48,0: >-b_D 24, >F_Ag_e)*8 ^ )
  $B( {spiccato} (24,0: ^cD>E )*16 ^  )
  $A3( (24,0: {default} >d~E {spiccato}  Gd  48,ge)*7   24,0:d/gA 48,B/ )
`;

players.cello.part = `
-31@
  $A1( (24,1: dEGd  48,g^)*8 ^ )
  $A2( (48,1: >-b_D 24, F_Ag_e)*8 ^ )
  $B( {spiccato}(48,1: cGcG)*8 ^ )
  $A3( (24,1: dEGd  48,ge)*7  24,1: d/EF  48,G/ )
`;

players.violin1.master = master;
players.violin1.substitutions = substitutions;
players.violin2.master = master;
players.violin2.substitutions = substitutions;
players.viola.master = master;
players.viola.substitutions = substitutions;
players.cello.master = master;
players.cello.substitutions = substitutions;

//var seq = new Sequencer();
//seq.load([players.violin1]);
//eq.start();
module.exports = players;
