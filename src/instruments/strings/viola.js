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
    dynamics c11
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
    bow position c16
    vibrato speed = C17
    slur transition while held down = c#1
    con sordino F1 off = F#1
    vib speed = c17
    */
    default: '[-2:C] [-2:+A] 80=V 90=C11 90=C1 0=C14 0=C15 60=C16 30=C17  0=ON  -7=OFF ',
    slow: '-13=ON 1=OFF',
    fast: '-3=ON 1=OFF',
    legato: '[-2:C]  0=C14 127=C15 -12=ON 1=OFF ',
    detached: '[-2:C] 0=C14 0=C15 0=ON  -7=OFF',
    staccato: '[-2:D] 50=V  0=ON  -7=OFF',
    spiccato: '[-2:D] 70=V  0=ON  -7=OFF',
    pizzicato: '[-2:+D]  0=ON  -7=OFF',
    accent: '120=C11 100=V',
    portamento: '127=C14 20=V -10=ON 1=OFF [-2:C]',
    tremolo: '[-2:E]',
    consordino: '',
  },
  sacconi: performers.sacconi,
  cinestrings: performers.cinestrings
};

module.exports = {
  name: 'viola',
  test: test,
  performers: performers
}

