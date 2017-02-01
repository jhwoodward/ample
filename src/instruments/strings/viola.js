var performers = require('./performers');

var test = {
  parts: {
    legato: '24,1: {detached} cGc {legato} 12,cDEFGA-B  C//^b~C//^'
  }
};

var performers = {
  triobroz: performers.triobroz,
  sacconi: performers.sacconi,
  cinestrings: performers.cinestrings
};

module.exports = {
  name: 'viola',
  test: test,
  performers: performers
}

