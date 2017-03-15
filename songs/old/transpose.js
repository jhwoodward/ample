var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;


var yankc = `120=T 2:12,cD>'E/'G/G//Ag/'e/'c//D>'E/'E/'d/'c/D//^//
          cD'>E/'G/G//A'>g/e/c//D'>E/'E/'d/'d/c//^//`;

var yank2 = ` 0:24, ^C^g^C^g^C^g^g^//C^g^C^g^C^g^C^/`;

var yank3 = '1:12,^/ ' + loop(`^/G^//GG`,8);

var keys = {  
  'c-minor': 'K(  -e -a  )K',
  'f-major': 'K( -b )K',
  'bflat-major': 'K( -b -e )K',
  'eflat-major': 'K( -b -e -a  )K',
  'cpent': 'S(CDEGA)S'
};


var tunes = {
  'yankc' : yankc,
  'yank2': yank2,
  yank3: yank3
}

var rules = Object.assign(keys, tunes);

part = loop(' 0@ cpent yankc 3@ yankc 5@ yankc ',2);
part2 = loop(' 0@ cpent yank2 3@ yank2 5@ yank2 ',2);
part3 = loop(' 0@ cpent yank3 -3@ yank3 -7@ yank3 ',2);
console.log(part);

make({parts:[part,part3,part2]}, rules).play();
