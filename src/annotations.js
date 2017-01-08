
var annotations = {
  triobroz: {
    default: '[-3:C] 8192=P',
    staccato: '[-3:+D]',
    legato: '[-3:C] 8192=P',
    'legato-nonvib': '[-3:+C]',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E]',
    pizz: '[-3:E]',
    accent: '120=V',
    glissando: '0=P'
  },
  cinebrass: { //MIDI CC MAP setting
    default:'20=C3 40=VB',
    legato: '20=C3',
    staccato: '50=C3',
  }
};

module.exports = annotations;