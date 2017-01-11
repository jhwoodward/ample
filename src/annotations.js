
var annotations = {
  triobroz: {
    staccato: '[-3:+D]',
    legato: '[-3:C] 8192=PP -7=ON',//need to split out phrase legato from note legato
    'legato-nonvib': '[-3:+C]',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E]',
    pizz: '[-3:E]',
    accent: '120=V',
    glissando: '0=P'
  },
  cinebrass: { //VELOCITY MAP setting
    legato: '20=CP3 127=CP64 -7=ON 5=OFF',
    detached4: '20=CP3 127=CP64 0=ON 120=VP -15=OFF',
    detached2: '20=CP3 127=CP64  0=ON  -20=OFF',
    staccato: '50=VP  0=CP64',// 0.5=LEN ? harcoded for now
    staccato8: '50=VP  0=CP64',
    staccato4: '100=VP  0=CP64',
    staccato2: '120=VP  0=CP64',
  },
  herringClarinet: { //VELOCITY MAP setting
    legato: '[-2:C] -7=ON 5=OFF',
    detached: '[-2:C] 0=ON -5=OFF',
    staccato: '[-2:D]  120=VP',// 0.5=LEN ? harcoded for now
    staccato8: '[-2:D] 20=VP '
  }
};

module.exports = annotations;