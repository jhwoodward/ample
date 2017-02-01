var performers = require('./performers');

var test = {
  parts: {
    stacc: '{staccato} 0:12,cbagfed  {legato} c//^G~c//^'
  }
};

var performers = {
  triobroz: performers.triobroz,
  tinaguo: {
    name: 'tinaguo'
  },
  sacconi: performers.sacconi,
  cinestrings: performers.cinestrings
  
};

module.exports = {
  name: 'cello',
  test: test,
  performers: performers
};