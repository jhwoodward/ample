////var Sequencer = require('../src/sequencer/Sequencer');
var utils = require('../src/utils');
var ensemble = require("../src/instruments/ensemble");
var instruments = require("../src/instruments/instruments");
var animations = require("../src/animations");
var performer = ensemble.stringQuartet.performers.friedfischtriobroz;
var players = utils.playersFromEnsemble(ensemble.stringQuartet, performer, true);

var substitutions = {
  harmony: `     72,  Cmaj bass:1 /  bass:5       /  Amin bass:1  /  Fmaj bass:5  /         
                      Cmaj bass:5  / Dmin bass:5  /  F6 bass:5    /  Gmaj bass:1  /
  `,
  melody: ` 1:24, <s E/_F _G/_c s>   ~A/_B _C/_a  <s _g/_e s> <p _d/_c_D// _g// p> ^`


};

var master = `120=T   (harmony)   `;

var harmony = {
  c: [-3, -5, -7 -9]
}
/*
harmony options

- follow violin1 transposing +/- n interval and then force fit to chord pattern
- choose one of a set of predefined interval options (eg -3,-5) that fit to the chord pattern
- set a min / max distance (eg -2,-5) favouring the closest possible that fits the chord pattern
- mirror the melody across a line, with optional transpose
- have a middle part the changes as litte as possible

              x  x x x  x
    x  x   x               x   x  x
x x           x  x x x  x            x  x x  x x   x --- melody
    x  x   x               x   x  x 
x x                                  x  x x  x x   x --- melody follower

x x x  x   x               x   x  x  x  x x  x x   x --- middle line
              x  x x x  x
x x                                  x  x x  x x   x --- melody mirror
    x  x   x               x   x  x  
              x  x x x  x


would be good if the rhythms of each line could be independent also

bassline - needs to indicate whether it should provide the 1st, 4th or 5th of the scale

store instrument range as metadata to avoid going outside
*/



players.violin1.part =`(melody)  `;

players.violin2.part = `constrain:chord -4@ (melody) `;


players.viola.part = ` constrain:chord -10@ (melody)`;

players.cello.part = ` constrain:bass constrain:chord   mirror((melody))mirror`;

players.violin1.master = master;
players.violin1.substitutions = substitutions;
players.violin1.animations = animations;

players.violin2.master = master;
players.violin2.substitutions = substitutions;
players.violin2.animations = animations;
players.violin2.dependencies = ['violin1'];

players.viola.master = master;
players.viola.substitutions = substitutions; 
players.viola.animations = animations;

players.cello.master = master;
players.cello.substitutions = substitutions;
players.cello.animations = animations;

//var seq = new Sequencer();
//seq.load([players.cello]);
//seq.start();

module.exports = players;
