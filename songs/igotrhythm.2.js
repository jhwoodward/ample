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
var animations = {
  c: {
    0: '1=C1',
    10: '10=C1',
    20: '20=C1',
    30: '20=C1',
    40: '40=C1',
    50: '50=C1',
    60: '60=C1',
    70: '70=C1',
    80: '80=C1',
    90: '90=C1'
  }, 
  s: {
    0: '50=C1',
    20: '60=C1',
    30: '70=C1',
    40: '90=C1',
    42: '95=C1',
    45: '100=C1',
    47: '105=C1',
    50: '110=C1',
    55: '110=C1',
    60: '110=C1',
    70: '110=C1',
    80: '100=C1',
    85: '95=C1',
    90: '90=C1'
  },
  p: {
    0: '10=C1',
    20: '30=C1',
    30: '60=C1',
    40: '90=C1',
    50: '127=C1',
    60: '120=C1',
    70: '100=C1',
    80: '80=C1',
    90: '40=C1'
  }
};


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
/*
players.violin2.constraints = [{
  type: 'pitch',
  player: 'violin1',
  allowIntervals: [-3, -5, -7 -9]
}];*/
players.violin2.substitutions = substitutions;
players.viola.master = master;
players.viola.substitutions = substitutions; 
players.cello.master = master;
players.cello.substitutions = substitutions;

//var seq = new Sequencer();
//seq.load([players.violin1]);
//seq.start();

 module.exports = players;
