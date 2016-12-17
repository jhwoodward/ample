var play = require('../src/ample-player');
var utils = require('../src/utils');
var loop = utils.loop;

var melody = ['',
	`24,1: C/b-bg/-BB `
	];

var harmony = ['',
	`24,1: E/-edb/D-E `,
  `12,1: E//-e//d//b//D/-E/ `,
	];

var octaves = ['',
  `12,2: cC^c C^cC ^cC^ cC^c`
  ];

var part1 = loop(melody[1],8);
var part2 = loop(harmony[1],2) + loop(harmony[2],6);
var part3 = utils.barRest(4) + loop(octaves[1], 4);

var song = { name:'pop', parts: [part1,part2,part3] };
//console.log(song);
play(song, 'IAC Driver Bus 1');
