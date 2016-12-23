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
   `12,1:cC^c C^cC ^cC^ cC^c Cc^C `
  ];

var bass = ['',
  `12,3:'cd'efga`
]


var part1 = loop(melody[1] + barRest(3),8);
var part2 = loop(harmony[1]  + barRest(2),2) + loop(harmony[2],6);
var part3 = barRest(4) + loop(octaves[1], 4);
var part4 = barRest(2) + loop(bass + barRest(2),8);
var song = { name:'pop', parts: [part1,part2,part3,part4] };



make(song).play();




