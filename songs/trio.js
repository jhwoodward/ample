
var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");

var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

/*
https://en.wikipedia.org/wiki/Ternary_form

[(A-A-B-B) (C-C-D-D) (A-B)]
[(A–B–A)(C–D–C)(A–B–A)] 
[(A–A–B–B–A)(C–C–D–D–C)(A–B–A)]
[(A–A–B–A-B–A)(C–C–D–C-D–C)(A–B–A)]
*/

var master = `120=T 192, 
( $A // $A // $B // $B // ) 
( $C // $C // $D // $D // ) 
( $A // $B // )  `;
players.violin1.master = master;
players.violin2.master = master;
players.viola.master = master;
players.cello.master = master;

players.violin1.part = `

`;
players.violin2.part = `

`;

players.viola.part = `

`
players.cello.part = `

`;

module.exports =players;
