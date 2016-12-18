var make = require('../src/ample').make;
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
  `12,1:'c'c'c'c`//^cC^ cC^c C^cC ^cC^ `
  ];

var part1 = loop(melody[1],8);
var part2 = loop(harmony[1],2) + loop(harmony[2],6);
var part3 = barRest(4) + loop(octaves[1], 4);

var song = { name:'pop', parts: [part1,part2,part3] };

var l = loop(octaves[1],9);
console.log(l);

make(l).play();


