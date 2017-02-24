var parse = require('./parse');
var midi = require('./midi');
var _ = require('lodash');

function interpret(player, conductor) {

  var def = {
    default: '',
    staccato: '',
    detached: '',
    legatoslow: '',
    legatoquick: '',
    legato: '',
    spiccato: '',
    spic: '',
    pizzicato: '',
    pizz: '',
    accent: '120=V',
    portamento: ''
  };

  var baseExpression = {
    pitchbend: 8192,
    velocity: 90,
    controller: {},
    keyswitch: undefined,
    on: 0,
    off: 0
  }

  player.annotations = _.extend(def, player.annotations);

  conductor = _.merge({}, conductor); //copy object to avoid mutations splling out
  player = _.merge({}, player);

  var defaultExpression;
  if (player.annotations.default) {
    if (typeof player.annotations.default === 'string') {
      defaultExpression = parse(player.annotations.default)[0].expression.note;
      delete defaultExpression.articulations;
    } else {
      defaultExpression = Object.assign({}, baseExpression, player.annotations.default);
    }
    defaultExpression.name = 'default';
  }

  player.annotations.default = {
    raw: player.annotations.default,
    expression: defaultExpression
  }

  for (var key in player.annotations) {
    if (key !== 'default') {
      var expression, animation;
      if (typeof player.annotations[key] === 'string') {
        expression = parse(player.annotations[key], null, { default: { expression: defaultExpression } })[0].expression.note;//evaluated against note expression
        delete expression.articulations;
      } else if (player.annotations[key].values) { //animation
        animation = player.annotations[key];
      } else {
        expression = Object.assign({}, baseExpression, player.annotations[key]);
      }
      if (expression) {
        expression.name = key;
        player.annotations[key] = {
          raw: player.annotations[key],
          expression: expression
        };
      }
      if (animation) {
        animation.name = key;
        player.annotations[key] = {
          animation: animation
        };
      }
    }
  }

  var parsed = parse(player.score, conductor, player.annotations);
  return midi(player, parsed);
}

module.exports = interpret;