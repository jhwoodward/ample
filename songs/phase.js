var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;


var tune1=`0: 24, c//D //E/ //// ////`;// x 1

var tune2=`1:  8, ^//g f//e //g/ `;//x 4

var tune3=`-1:6, ^/// ///e //// /BC//`; // x4

var part1 = `120=T 
0: c7 0@
 ${loop('tune1',2)}
f7 3@
${loop('tune1',2)}
 0: g7 5@
 ${loop('tune1',2)}
 0: c7 0@
 ${loop('tune1',2)}
 `;


var part2 = `
0: c7 0@
 ${loop('tune2',8)}
f7 3@
${loop('tune2',8)}
 0: g7 5@
 ${loop('tune2',8)}
 0: c7 0@
 ${loop('tune2',8)}
 `;

var part3 = `
0: c7 0@
 ${loop('tune3',8)}
f7 3@
${loop('tune3',8)}
 0: g7 5@
 ${loop('tune3',8)}
 0: c7 0@
 ${loop('tune3',8)}
 `;


var tunes = {
  tune1: tune1,
  tune2: tune2,
  tune3: tune3
}
var chords = {
  'c7': 'S(CD-EGA-B)S', //aminor
  'f7': 'S(FG-AC-E)S', //dminor
  'g7': 'S(GA-BBDF)S' //gminor

}



var rules =  Object.assign(tunes,chords);

make({name:'phase', parts:[part1,part2,part3]}, rules).play();
