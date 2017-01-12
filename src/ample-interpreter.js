var parse = require('./parse');
var generateEvents = require('./generateEvents');
var _ = require('lodash');

function send(player, conductor) {

  conductor = _.merge({}, conductor); //copy object to avoid mutations splling out
  player = _.merge({}, player);

  player.config = _.merge({
    detach: -5,
    legato: 5,
    legatoTransition: 0,
    defaultExpression: {
      velocity: 80,
      dynamics: 100,
      pitchbend: 8192
    }
  },
    player.config);

  var annotations = {};
  for (var key in player.annotations) {
    var expression = parse(player.annotations[key], null, null, player.config.defaultExpression)[0].expression.note;//evaluated against note expression
    expression.name = key;
    console.log(key, player.annotations[key], expression);
  
    annotations[key] = {
      raw: player.annotations[key],
      expression: expression
    };
  }
  player.annotations = annotations;
  /*
    if (player.annotations.default) {
      player.config.defaults = _.merge(player.config.defaults, player.annotations.default.state.expression);
    }
  */


  var parsed = parse(player.score, conductor, annotations, player.config.defaultExpression);
  return generateEvents(player, parsed);
}

function sendTempo(tempo) {

  events.push({
    type: 'tempo',
    value: tempo,
  });

}


var api = {
  send: send
};

module.exports = api;