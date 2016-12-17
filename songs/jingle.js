var play = require('../src/ample-player');

var jingle1 = ['',
	'12,1:E^E^E/// E/E/E/// E/G/c//DE/// ////',
	'     F/F/F//F F/e/e//e e/d/d/E/d/// G///',
	'     F/F/F//F F/e/e/e6,ee12, G/G/f/d/c/// ////',
  '24,1:E/// E^// E^E^ E/// F^// e^// +F^+F^ G///',
  '12,1:F/F/F/FFF/e/e/eee/d/d/E/d////////'
	];

var jingle2 = ['',
 	'24,-1:cGgG cGgG cGgG ccDE',
 	'      FAfA cEcEd +Fd+F Gfed',
 	'     FAfA cEcE ggAB CgC/',
   '24,-1: c///c^//c^^^ccDE'
 	];
 	
var part1 = jingle1[4] + jingle1[5] + jingle1[4] + jingle1[3];
var part2 = jingle2[4] + jingle2[2] + jingle2[1] + jingle2[3];

var song = { name:'jingle', parts: [part1,part2] };

play(song, 'IAC Driver Bus 1');
