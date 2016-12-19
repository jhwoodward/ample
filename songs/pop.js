var make = require('../src/ample').make;
var play = require('../src/play');
var utils = require('../src/utils');
var loop = utils.loop;
var barRest = utils.barRest;

var melody = ['',
	`24,1: 'C/'b'-b'g/-'B'B `
	];

var harmony = ['',
	`24,1: 'E/'-e'd'b/'D-'E `,
  `12,1: E//-e//d//b//D/-E/ `,
	];

var octaves = ['',
  `12,1:'c'd'e'fga`,//^cC^ cC^c C^cC ^cC^ `
   `12,1:cC^c C^cC ^cC^ cC^c Cc^C `
   
  ];


var part1 = loop(melody[1],8);
var part2 = loop(harmony[1],2) + loop(harmony[2],6);
var part3 = barRest(4) + loop(octaves[2], 4);

var song = { name:'pop', parts: [part1,part2,part3] };



make(song).play();




