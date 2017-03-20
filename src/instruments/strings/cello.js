var performers = require('./performers');

var test = {
  parts: {
    stacc: '{staccato} 0:12,cbagfed  {legato} c//^G~c//^'
  }
};

var performers = {
  triobroz: {
    name: 'triobroz',
    default: '[-3:C] 100=V 100=C1 8192=P 0=ON -5=OFF',
    detached: '[-3:C] 8192=P 0=ON -5=OFF',
    staccato: '[-3:D] 70=V',
    legato: '[-3:C] 100=C1  8192=P -7=ON 1=OFF',
    slow: '-12=ON 1=OFF',
    fast: '-3=ON 1=OFF',
    spiccato: '[-3:D] 90=V  0=ON -5=OFF',
    pizzicato: '[-3:E] 50=V',
    accent: '[-3:C] 120=C1 16383=P',
    //accent: '[-3:D] 110=V',
    portamento: '0=P  -7=ON 1=OFF'
  },
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