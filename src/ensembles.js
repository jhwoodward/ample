var instruments = require('./instruments/all');
var key = require('./rudiments').key;
//player channel dictated by order
var ensemble = {
  stringQuartet: {
    test: {
      conductor: {
        28: key.fsharp,
        56: key.aflat,
        84: key.dflat,
        112: key.cmaj
      },
      p1a: `1:48,  C//_~b  ////    ////    ////    ////  ////    ///^`,
      p2a: `0:48,  E///    ////    ////    /_~dcb  a///  ////    ///^`,
      p3a: `0:48,  G///    ////    //_~f/  ////    ////  ////    //^`,
      p4a: '-1:48, C///    //_~G/  ////    ////    //f/  d/_~g/  //^',
      part1: `p1a p1a p1a p1a p1a`,
      part2: `p2a p2a p2a p2a p2a`,
      part3: `p3a p3a p3a p3a p3a`,
      part4: `p4a p4a p4a p4a p4a`

      /*
      part1: '{legato} 2:24,e~FGA -BCD  E/^>F~e/c/g/^',
      part2: '{legato} 2:12,cDEFGA-B {legato} C^^^b~C//^',
      part3: '{staccato} 1:12,cbagfed  {legato} c//^G~c//^',
      part4: '{legato} 12,0:e~FGA -BCD////  E/^>F~e/c/g/^'
      */
    },
    instruments: [
      instruments.strings.violin,
      instruments.strings.violin,
      instruments.strings.viola,
      instruments.strings.cello,
    ],
    performers: {
      triobroz: [
        instruments.strings.violin.performers.triobroz,
        instruments.strings.violin.performers.triobroz,
        instruments.strings.viola.performers.triobroz,
        instruments.strings.cello.performers.triobroz
      ],
      triobrozfried: [
        instruments.strings.violin.performers.friedlander,
        instruments.strings.violin.performers.triobroz,
        instruments.strings.viola.performers.triobroz,
        instruments.strings.cello.performers.triobroz
      ],
      cinestrings: [
        instruments.strings.violin.performers.cinestrings,
        instruments.strings.violin.performers.cinestrings,
        instruments.strings.viola.performers.cinestrings,
        instruments.strings.cello.performers.cinestrings
      ],
      sacconi: {
        playable: [
          instruments.strings.violin.performers.sacconi.playable,
          instruments.strings.violin.performers.sacconi.playable,
          instruments.strings.viola.performers.sacconi.playable,
          instruments.strings.cello.performers.sacconi.playable
        ],
        individual: [
          instruments.strings.violin.performers.sacconi.individual,
          instruments.strings.violin.performers.sacconi.individual,
          instruments.strings.viola.performers.sacconi.individual,
          instruments.strings.cello.performers.sacconi.individual
        ]
      }
    }

  },
  stringTrio: {
    test: {

    },
    instruments: [
      instruments.strings.violin,
      instruments.strings.viola,
      instruments.strings.cello
    ]
  },
  octet: {
    test: {

    },
    instruments: [
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