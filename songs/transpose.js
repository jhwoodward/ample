var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;


var yankc = `124=T 0:12,cD>'E/G/G//Ag/e/c//D>'E/E/d/c/D/////
          cD'>E/G/G//A'>g/e/c//D'>E/E/d/d/c/////`;

var keys = {
  'c-minor': 'K(  -e -a  )K',
  'f-major': 'K( -b )K',
  'bflat-major': 'K( -b -e )K',
  'eflat-major': 'K( -b -e -a  )K',
  'cpent': 'S(CD-E)S'
};


var tunes = {
  'yankc' : yankc
}

var rules = Object.assign(keys, tunes);

part = ' 0@ cpent yankc 3@ yankc 5@ yankc ';


console.log(part);

make(part, rules).play();
