var performers = require('./performers');

var test = {
  rules: {
    tune: '>GedE>FdcD>Ed>Ed>c//^ '
  },
  parts: {
    gliss: '24,2:  {detached} cGc {legato} 12,cDEFGA-B  C//^b~C//^',
    phrase: `24,2: {detached} c_D_E F_G_A B C {pizzicato} >Gf>ed {legato} c/////^`,
    pizz: `2: 24, {pizzicato} tune {legatoslow} tune {detached} tune `,
    accent: `24,2: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`,
    spic: '{spiccato} 48,2:c >c {detached} 24, c_D E_F e_d {spiccato} 48,  >c >c c c >c',
    part1: '{legato} 2:24,e~FGA -BCD  E/^>F~e/c/g/^',
    legato: '{legato} 2:12,cDEFGA-B {legato} C^^^b~C//^',
    staccato: '{staccato} 2:12,cbagfed  {legato} c//^G~c//^',
    legatoquick: '{legato} 12,2:e~FGA -BCD////  E/^>F~e/c/g/^',
  }
};

var performers = {
  triobroz: {
    name: 'triobroz',
    default: '[-3:C] 85=C1 8192=P 0=ON -5=OFF',
    detached: '[-3:C] 8192=P 0=ON -5=OFF',
    staccato: '[-3:+D]  0=ON  -7=OFF',
    p: '50=C1',
    f: '120=C1 120=V',
    legato: '[-3:C] 8192=P -12=ON 1=OFF',
    slow: '-12=ON 1=OFF',
    fast: '-3=ON 1=OFF',
    spiccato: '[-3:D]  0=ON  -7=OFF',
    pizzicato: '[-3:E] 50=C1',
    accent: '[-3:C] 120=C1 16383=P ',
    portamento: '0=P  -12=ON 1=OFF'
  },
  friedlander: {
    name: 'friedlander',
    /*
    true legato (as opposed to polyphonic): keyswitch -1:F 
    c17 = slur legato
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
    default: '[-1:F] [-2:G] 80=V 100=C1 0=C14 0=C15 0=C17  0=ON -5=OFF  ',
    detached: '[-2:G]  0=C15 0=ON  -7=OFF',
    p: '50=C1 50=V',
    f: '120=C1 120=V',
    slow: '-13=ON 1=OFF',
    legato: '[-2:G] [-1:F] 127=C15 -10=ON 1=OFF 80=C17',
    staccato: '[-2:A]  0=ON  -7=OFF',
    spiccato: '[-2:A]  0=ON  -7=OFF',
    pizzicato: '[-2:+A]  0=ON  -7=OFF',
    accent: '120=V',
    portamento: '127=C14 -7=ON 1=OFF'
  },
  sacconi: performers.sacconi,
  cinestrings: performers.cinestrings
};

module.exports = {
  name: 'violin',
  test: test,
  performers: performers
};

