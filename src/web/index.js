var eventType = require('../interpreter/constants').eventType;
var utils = require('../interpreter/utils');
var Interpreter = require('../interpreter/Interpreter');
var Sequencer = require('./Sequencer.js');
var rainbow = require('../../songs/rainbow');

var seq = new Sequencer();
seq.load(rainbow);
console.log(seq.events);

