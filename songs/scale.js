var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var scaleC = '0:24,cDEFGABCbagfedc/';
var repeat = '0:24,cDE+_+_+_++_++++++_--_-_-_';
var repeat2 = '0:12,CD24,+_+_+____EG+++_fde+_+_+_++_+++++++_--_-_-_';
var scaleF = '0:12,fGABCDEFedcbagf/';
var scaleE = '0:12,eFGABCDEdcbagfe/';
var tune = '0:8,c/EG/eF/ed/bC/Ed/bg/////'

var c ='0:48,c';
var f='0:f';
var yank = '0:12,_++_24,++_+++_/_';
var yankc = '0:12,cDE/G/G//Ag/e/c//DE/E/d/c/D/////'
yankc += 'cDE/G/G//Ag/e/c//DE/E/d/d/c/////';
var yankrel = '12,_++_++_/+++_/_//++_--_/---_/----_//++_++_/_/--_/--_/++_/////';

var keys = {
  'c-minor': 'K(  -e -a  )K',
  'f-major': 'K( -b )K',
  'bflat-major': 'K( -b -e )K',
  'eflat-major': 'K( -b -e -a  )K'
};

var keyCircle = {
  /*
  'cmaj': 'K()K', //aminor
  'fmaj': 'K(-b)K', //dminor
  'bflat': 'K(-b-e)K', //gminor
  'eflat': 'K(-b-e-a)K', //cminor
  'aflat': 'K(-b-e-a-d)K', //fminor
  'dflat': 'K(-b-e-a-d-g)K', //bflat minor
  'fsharp': 'K(+f+c+g+d+a+e)K', //eflat minor
  'bmaj': 'K(+f+c+g+d+a)K', //gsharp minor
  'emaj': 'K(+f+c+g+d)K', //csharp minor
  'amaj': 'K(+f+c+g)K', // fsharp minor
  'dmaj': 'K(+f+c)K', // b minor
  'gmaj': 'K(+f)K', // e minor
  'cmaj': 'K()K', //a minor
  */
 // 'cmaj': 'K()K ',
  'yankc' : yankc,
  'cpent': ' S( CDEFGA )S'


}



var part = '';
for (var key in keyCircle) {
  //part += key + ' '  + repeat;
   part += key + ' yankc ';
  //  part += key + ' '  + f + yank;

}
console.log(part);

var rules = keyCircle;

make(part, rules).play();
