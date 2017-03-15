var macroType = require('./constants').macroType;
var parserUtils = require('./parserUtils');

var api = {
  buildMacros: function (substitutions, annotations, articulations) {
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
  addModifier: function(state, modifier, condition) {
    var exists = !!state.modifiers.filter(m => m.id === modifier.id).length;

    if (exists) {
      state.modifiers.forEach((m, i) => {
        if (m.id === modifier.id) {
          state.modifiers.splice(i, 1);
        }
      });
    }

    if (condition) {
      state.modifiers.push(modifier);
    }

  }
};

module.exports = api;
