var play = require('../src/ample-player');

var jingle1 = ['',
	'12,1:E/E/E/// E/E/E/// E/G/c//DE/// ////',
	'     F/F/F//F F/e/e//e e/d/d/E/d/// G///',
	'     F/F/F//F F/e/e//e G/G/f/d/c/// ////'
	];

var jingle2 = ['',
 	'24,0:cGgG cGgG cGgG ccDE',
 	'      FAfA cEcEd +Fd+F Gfed',
 	'     FAfA cEcE ggAB CgC/'
 	];
 	
var part1 = jingle1[1] + jingle1[2] + jingle1[1] + jingle1[3];
var part2 = jingle2[1] + jingle2[2] + jingle2[1] + jingle2[3];

var song = { name:'jingle', parts: [part1, part2] };

play(song);
