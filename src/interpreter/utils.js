var macroType = require('./constants').macroType;
var parserUtils = require('./parserUtils');
var _ = require('lodash');

var api = {
  combineMacros: function (player) {

    player.annotations = _.extend({
      accent: '120=V'
    },
    player.annotations);
    player.substitutions = player.sub || player.substitutions;

    return api.buildMacros(
      player.substitutions, 
      player.annotations, 
      player.articulations, 
      player.animations, 
      player.constraints
    );
  },
  buildMacros: function (
    substitutions, 
    annotations, 
    articulations, 
    animations, 
    constraints
    ) {
    var macros = [];

    var articulations = articulations || {
      '>': annotations.accent,
      '~': annotations.portamento,
      '_': annotations.legato,
      '\'': annotations.staccato
    };

    articulations = parserUtils.strip(articulations);

    for (var key in annotations) {
      var macro = {
        type: macroType.annotation,
        key: key,
        value: annotations[key]
      }
      macros.push(macro);
    }
    for (var key in articulations) {
      var macro = {
        type: macroType.articulation,
        key: key,
        value: articulations[key]
      }
      macros.push(macro);
    }
    for (var key in substitutions) {
      var macro = {
        type: macroType.substitution,
        key: key,
        value: substitutions[key]
      }
      macros.push(macro);
    }

    for (var key in animations) {
      var macro = {
        type: macroType.animation,
        key: key,
        values: animations[key]
      }
      macros.push(macro);
    }

    if (constraints) {
       macros = macros.concat(constraints);
    }
  
    return macros;

  },
  eventsFromStates: function (states) {
    return states.reduce(function (acc, item) {
      acc = acc.concat(item.events);
      return acc;
    }, []).sort(function (a, b) {
      return a.tick > b.tick ? 1 : -1;
    });
  },
  addModifier: function (state, modifier, condition) {
    var exists = !!state.modifiers.filter(m => m.id === modifier.id).length;

    if (exists) {
      state.modifiers.forEach((m, i) => {
        if (m.id === modifier.id) {
          state.modifiers.splice(i, 1);
        }
      });
    }
    if (condition === undefined || condition) {
      state.modifiers.push(modifier);
    }
  },
  removeModifier: function (state, modifier) {
    var exists = !!state.modifiers.filter(m => m.id === modifier.id).length;
    if (exists) {
      state.modifiers.forEach((m, i) => {
        if (m.id === modifier.id) {
          state.modifiers.splice(i, 1);
        }
      });
    }
  }
};

module.exports = api;
