var parse = require('./parse');
var generateEvents = require('./generateEvents');
var _ = require('lodash');

function send(player, conductor) {

  conductor = _.merge({}, conductor); //copy object to avoid mutations splling out
  player = _.merge({}, player);

  var defaultExpression;
  if (player.annotations.default) {
    defaultExpression = parse(player.annotations.default)[0].expression.note;
    defaultExpression.name = 'default';
    delete defaultExpression.articulations;
  } 

  player.annotations.default = {
    raw: player.annotations.default,
    expression: defaultExpression
  } 

  console.log(player.annotations.default)

  for (var key in player.annotations) {
    if (key !== 'default') {
      var expression = parse(player.annotations[key], null, {default: {expression:defaultExpression}})[0].expression.note;//evaluated against note expression
      expression.name = key;
      delete expression.articulations;
      player.annotations[key] = {
        raw: player.annotations[key],
        expression: expression
      };
    }
  }

  var parsed = parse(player.score, conductor, player.annotations);
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