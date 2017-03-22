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



players.violin1.part = ` {pizzicato}
-3@
  $A1(  (48,1: cEGe)*8  )
  $A2(  (24,1: cEGe)*16  )
  $B(  (48,1: aBCb)*8  )
  $A3( (48,1: EcEc)*8  )
`;
players.violin2.part = ` {pizzicato}
-8@
  $A1(  (48,1: cEGe)*8  )
  $A2(  (24,1: cEGe)*16  )
  $B(  (48,1: aBCb)*8  )
  $A3( (48,1: EcEc)*8  )

`;

players.viola.part = ` {pizzicato}

  -17@
  $A1(  (48,1: cEGe)*8  )
  $A2(  (24,1: cEGe)*16  )
  $B(  (48,1: aBCb)*8  )
  $A3( (48,1: EcEc)*8  )

`
players.cello.part = ` {pizzicato}

-30@
  $A1(  (48,1: cEGe)*8  )
  $A2(  (24,1: cEGe)*16  )
  $B(  (48,1: aBCb)*8  )
  $A3( (48,1: EcEc)*8  )

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
