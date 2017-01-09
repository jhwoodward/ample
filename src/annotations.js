
var annotations = {
  triobroz: {
    staccato: '[-3:+D]',
    legato: '[-3:C] 8192=P -7=ON',
    'legato-nonvib': '[-3:+C]',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E]',
    pizz: '[-3:E]',
    accent: '120=V',
    glissando: '0=P'
  },
  cinebrass: { //VELOCITY MAP setting
    legato: '20=C3 127=C64 -7=ON 5=OFF',
    detached4: '20=C3 127=C64 -10=OFF',
    staccato: '50=VB  0=C64',// /2=OFF ? harcoded for now
    staccato8: '50=VB  0=C64',
    staccato4: '100=VB  0=C64',
    staccato2: '120=VB  0=C64',
  }
};

module.exports = annotations;