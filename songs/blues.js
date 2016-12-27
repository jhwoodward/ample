var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var scaleC = '0:24,cDEFGABCbagfedc/';
var repeat = '0:24,cDE+_+_+_++_++++++_--_-_-_';
var repeat2 = '0:12,CD24,+_+_+____EG+++_fde+_+_+_++_+++++++_--_-_-_';
var scaleF = '0:12,fGABCDEFedcbagf/';
var scaleE = '0:12,eFGABCDEdcbagfe/';
var tune = '0:8,c/EG/eF/ed/bC/Ed/bg/////'



var part = `120=T 2:12,
0: c7 0@
 cD yank2 2@ yank2
f7 3@
  yank2 4@ yank2
   c7 0@
  yank1
  f7 3@
  yank1
   g7 5@
 yank2
 f7 yank2
 g7 yank2
 f7 yank2
 g7 yank2
 f7 yank2
 c7 0@
  yank1 yank1
 `;


var tunes = {
  yank1: `0:>'e/'G/G//Ag/'e/'c//D>'E/'E/'d/'c/D//^/cD`,
  yank2: `0:'e/'G/G//Ag/'e/'c//D`
}
var chords = {
  'c7': 'S(CD-EEGA-B)S', //aminor
  'f7': 'S(FG-AAC-E)S', //dminor
  'g7': 'S(GA-BBDF)S' //gminor

}



var rules =  Object.assign(tunes,chords);

make(part, rules).play();
