function SubInterpreter(initialState) {
  this.states = [];
  this.statelessEvents = [];
  this.next = initialState;
}
SubInterpreter.prototype.getTopState = function () {
  return this.states[this.states.length - 1];
}
SubInterpreter.prototype.getNextState = function () {
  return this.getTopState().clone();
}
SubInterpreter.prototype.appendState = function (states) {
  this.states = this.states.concat(states);
}
SubInterpreter.prototype.generateState = function (parsers) {
  for (var i = 0; i < parsers.length; i++) {
    var parser = parsers[i];
    var state = this.next || this.getNextState();
    state.mutate(parser, this);

    if (parser.continue) {
      if (parser.getEvents) {
        this.statelessEvents = this.statelessEvents.concat(parser.getEvents());
      }
      continue;
    }
    this.states.push(state);
    this.next = this.getNextState();
    if (parser.next) {
      parser.next(this.next);
    }
  }
}
module.exports = SubInterpreter;