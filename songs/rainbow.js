var Sequencer = require('../src/sequencer/Sequencer');
var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");
var animations = require("../src/animations");
var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

/*
https://en.wikipedia.org/wiki/Thirty-two-bar_form
- chords from over the rainbow

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


var harmonies = {
  c: [-3, -5, -7 -9]
}


players.violin1.animations = animations;
players.violin1.part =`
  $A1( (48,1: <p D/ p> 24, <s -B_DD_-b s> )*8  )
  $A2( (24,1: <s d_EG_d_g/_e/ s>)*8  )
  $B( {spiccato} (24,1:  <s eGcEbgDaCEGAbdbC s> )*4   )
  $A3( {default} (48,1: <s -b_D 24, _F_Ag_e s> )*7 48,1: {spiccato} _-b  FA// ^ )
`;


players.violin2.animations = animations;
players.violin2.part = `
  $A1( (48,1: <s F_b s> 24, <s F_bb_F s> )*8  ) 
  $A2( (24,1: <s b_ag_A s>  48,a_C)*8  )
  $B( {spiccato} (24,1: <c ^cDE ^cDE c> )*8   )
  $A3( {default} (48,1: <s g_e 24, _e_cg_E s> )*7 48,1: {spiccato} _g  gg// ^  )
`;

players.viola.part = `
3@
  $A1( (24,0: d_>E_>G_d  48,>g_e)*8  )
  $A2( (48,0: >-b_D 24, >F~Ag_e)*8  )
  $B( {spiccato} (24,0: ^cD>E )*16   )
  $A3( (24,0: {default} >dE {spiccato}  Gd  48,ge)*7   24,0:d/gA 48,B/ ^ )
`;

players.cello.part = `
-25@
  $A1( (24,1: d_E_G_d  48,G^)*8  )
  $A2( (48,1: >-b_D 24, >F~A_g_e)*8  )
  $B( {spiccato}(48,1: cGcG)*8  )
  $A3( (24,1: dEGd  48,ge)*7  24,1: d/EF  48,G/ ^ )
`;

players.violin1.master = master;
players.violin1.substitutions = substitutions;
players.violin2.master = master;

players.violin2.substitutions = substitutions;
players.viola.master = master;
players.viola.substitutions = substitutions; 
players.cello.master = master;
players.cello.substitutions = substitutions;
//
//var seq = new Sequencer();
//seq.load([players.violin1]);
//seq.start({marker:'A3'});

 module.exports = players;
