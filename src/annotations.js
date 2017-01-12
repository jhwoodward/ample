
var annotations = {
  triobroz: {
    staccato: '[-3:+D]',
    detached: '[-3:C] 8192=P 0=ON -2=OFF',
    legato: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
    'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E]',
    pizz: '[-3:E]',
    accent: '120=V',
    glissando: '0=P'
  },
  cinebrass: { //VELOCITY MAP setting
    legato: '20=C3 127=C64 -7=ON 5=OFF',
    detached4: '20=C3 127=C64 0=ON 120=V -15=OFF',
    detached2: '20=C3 127=C64  0=ON  -20=OFF',
    staccato: '50=V  0=C64',// 0.5=LEN ? harcoded for now
    staccato8: '50=V  0=C64',
    staccato4: '100=V  0=C64',
    staccato2: '120=V  0=C64',
  },
  herringClarinet: { 
    legato: '[-2:C] -7=ON 5=OFF ',
    detached: '[-2:C] 0=ON -5=OFF',
    staccato: '[-2:D]  120=V',// 0.5=LEN ? harcoded for now
    staccato8: '[-2:D] 20=V 127=C11'
  }
};

module.exports = annotations;