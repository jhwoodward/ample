var play = require('../src/ample-player');


function loop(phrase, n) {
	var out = '';
	for (var i = 1;i<=n;i++) {
   	out += phrase;
   }
  return out;
}

var jingle1 = ['',
	`12,1:>'E^'E^'E^'EE>>E'E'E >>E/EE^ E/>>'G^c//D>>'E^/// ////`,
	`1:     F/F/F//F e/'e^//e e/d/d/E/d// >'G^///`,
	'12,1:     F/F/F//F F/ e/ e/ 8,eee 12, G/G/f/d/c/// ////',
  '24,1:E/// E^// E^E^ E/// F^// e^// +F^+F^ G///',
  '24,1:E/// E^// E^E^ E/// F^// e^// d^d^ c///',
  '12,1:F/F/F/FFF/e/e/eee/d/d/E/d////////'
	];


var jingle2 = ['',
 	'24,-1:cGgG cGgG cGgG ccDE',
 	'      FAfA cEcEd +Fd+F Gfed',
 	'     FAfA cEcE ggAB CgC/',
   '24,-1: c/// c^// c^c^ ccDE'
 	];

var barRest = '48,^///';
 	
var part1 = loop(jingle1[1] + jingle1[2] + jingle1[5] + jingle1[3],4);
var part2 = loop(jingle2[1] + jingle2[2] + jingle2[1] + jingle2[3] + loop(barRest,2),4);

var song = { name:'jingle', parts: [part1,part2] };


play(song, 'IAC Driver Bus 1');
