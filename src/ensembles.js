var instruments = require('./instruments');

//player channel dictated by order
var ensemble = {
  stringQuartet: {
    test: {
      p1a: `1:48, C//_~b////////////////////////^`,
      p2a: `0:48, E////////////_~dcba///////////^`,
      p3a: `0:48, G/////////_~f/////////////////^`,
      p4a: '-1:48, C/////_~G///////////f/d/_~g//^',
      part1: `p1a p1a`,
      part2: `p2a p2a`,
      part3: `p3a p3a`,
      part4: `p4a p4a`

      /*
      part1: '{legato} 2:24,e~FGA -BCD  E/^>F~e/c/g/^',
      part2: '{legato} 2:12,cDEFGA-B {legato} C^^^b~C//^',
      part3: '{staccato} 1:12,cbagfed  {legato} c//^G~c//^',
      part4: '{legato} 12,0:e~FGA -BCD////  E/^>F~e/c/g/^'
      */
    },
    performers: [
      {
        instrument: instruments.strings.violin,
        annotations: instruments.strings.violin.annotations.triobroz
      },
      {
        instrument: instruments.strings.violin,
        annotations: instruments.strings.violin.annotations.friedlander
      },
      {
        instrument: instruments.strings.viola,
        annotations: instruments.strings.violin.annotations.triobroz
      },  
      {
        instrument: instruments.strings.cello,
        annotations: instruments.strings.cello.annotations.triobroz
      }
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
  },
  brassTrio: {

  },
  brassQuartet: {

  }
};

module.exports = ensemble;