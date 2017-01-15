var instruments = require('./instruments');

//player channel dictated by order
var ensemble = {
  stringQuartet: {
    test: {

    },
    players: [
      instruments.strings.violin,
      instruments.strings.violin,
      instruments.strings.viola,
      instruments.strings.cello
    ]
  },
  stringTrio: {
    test: {

    },
    players: [
      instruments.strings.violin,
      instruments.strings.viola,
      instruments.strings.cello
    ]
  },
  octet: {
    test: {

    },
    players: [
      instruments.woodwind.clarinet,
      instruments.woodwind.bassoon,
      instruments.brass.horn,
      instruments.strings.violin,
      instruments.strings.violin,
      instruments.strings.viola,
      instruments.strings.cello,
      instruments.strings.bass
    ]
  }
};

module.exports = ensemble;