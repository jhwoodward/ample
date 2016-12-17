var play = require('../src/ample-player');
var utils = require('../src/utils');
var loop = utils.loop;

var melody = ['',
	`12,1: C/b-bg/-BB `,
  '24,1: C/b-bg/-BB  C/b-bg/-BB 24,1: C/b-bg/-BB 24,1: C/b-bg/-BB'
	];

var harmony = ['',
	`12,1: E/-edb/D-E `,
  '24,1: C/b-bg/-BB  C/b-bg/-BB 24,1: C/b-bg/-BB 24,1: C/b-bg/-BB'
	];

var bass = ['',
 	`24,-1:cGgG cGgG cGgG ccDE`

 	];

var part1 = loop(melody[1],4);
var part2 = loop(harmony[1],4);
var part3 = loop(bass[1], 4);

var song = { name:'pop', parts: [part1,part2] };
//console.log(song);
play(song, 'IAC Driver Bus 1');
