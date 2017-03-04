var Parser = require('./Parser');
var State = require('./State');


function Interpreter(rules) {
  this.rules = rules;
}

Interpreter.prototype.interpret = function(part) {
  var parser = new Parser();
  var state = new State();
  var event, events = [];

  var parsers = parser.parse(part);
  console.log(parsers);

  parsers.forEach(parser => {
    event = parser.process(state);
    if (event) {
      events.push(event);
    }
  });
}

var interpreter = new Interpreter();

interpreter.interpret('120=T {part1} S(-A+BCD)S 3@ 50==C1 [-2:+A] a~-b//^!!!c 48, -2:defg');

