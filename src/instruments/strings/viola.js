var performers = require('./performers');

var test = {
  parts: {
    legato: '24,1: {detached} cGc {legato} 12,cDEFGA-B  C//^b~C//^'
  }
};

var performers = {
  triobroz: performers.triobroz,
  fischer: {
    name: 'fischer',
    /*
    true legato (as opposed to polyphonic): keyswitch -1:F 
    polyphonic: -1: +F
    bowed / fingered legato: C15 < 64 = bowed, C15 > 64 = fingered 
    portamento: C14 >0 = on, 0=off
    legato transition speed: C20
    bow position: C16
    grace note: ks -1:E - causes the following note to portamento from this note
    pizzicato: ks -1:+A
    staccato / spiccato: ks -1:A
    sustain (must be on for legato): ks -1:G
    */
    default: '[-2:C] [-2:+A] 80=V 100=C1 0=C14 0=C15  0=ON  -7=OFF ',
    legatoslow: '[-2:C] [-2:+A] 127=C15 -13=ON 1=OFF 0=C17',
    legato: '[-2:C] [-2:+A]  0=C14 127=C15 -10=ON 1=OFF 80=C17',
    detached: '[-2:C] 0=C14 0=C15 0=ON  -7=OFF',
    staccato: '[-2:D]',
    spiccato: '[-2:D]',
    pizzicato: '[-2:+D]',
    accent: '120=V',
    portamento: '127=C14 20=V -10=ON 1=OFF'
  },
  sacconi: performers.sacconi,
  cinestrings: performers.cinestrings
};

module.exports = {
  name: 'viola',
  test: test,
  performers: performers
}

