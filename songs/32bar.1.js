var Sequencer = require('../src/Sequencer');
var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

/*
https://en.wikipedia.org/wiki/Thirty-two-bar_form

*/
var substitutions = {
    chordsA: `96, Bb6 / Gmin7 /     Cmin7 / F7 /      Dmin7 / Gmin7 /     Cmin7 / F7 /
                  Fmin7 / Bb7 /     Eb6 / Ab7 /     Bb6 / F7  /     Bb6 /   /
    `,
  chordsB: `  96, D7  /     /         /      /     G7  /     /         /    /
                  C7  /     /         /      /     F7  /     /         /    /
                  `
}

var master = `120=T  $A (chordsA) $A (chordsA) $B (chordsB) $A (chordsA)   `;



players.violin1.part = `
  $A1( (48,1: -bD 24, FAge)*8 ^ )
  $A2( (24,1: dEGd  48,ge)*8 ^ )
  $B(  (24,1: eGcEbgDaCEGAbdbC )*4 ^  )
  $A3( (48,1: -bD 24, FAge)*8 ^ )
`;
players.violin2.part = `
-5@
  $A1( (48,1: -bD 24, FAge)*8 ^ )
  $A2( (24,1: dEGd  48,ge)*8 ^ )
  $B( {spiccato} (24,1: ^cDE )*16  ^ )
  $A3( (48,1: -bD 24, FAge)*8 ^ )

`;

players.viola.part = `
3@
  $A1( (24,0: dEGd  48,ge)*8 ^ )
  $A2( (48,0: -bD 24, FAge)*8 ^ )
  $B( {spiccato} (24,0: ^cDE )*16 ^  )
  $A3( (24,0: dEGd  48,ge)*8 ^ )
`
players.cello.part = `
-31@
  $A1( (24,1: dEGd  48,ge)*8 ^ )
  $A2( (48,1: -bD 24, FAge)*8 ^ )
  $B( {spiccato}(48,1: cGcG)*8 ^ )
  $A3( (24,1: dEGd  48,ge)*8 ^ )
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
//seq.load(players);
//seq.start();
module.exports = players;
