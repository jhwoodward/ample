
var annotations = {
  triobroz: {
    staccato: '[-3:+D]',
    default: '[-3:C]',
    legato: '[-3:C]',
    'legato-nonvib': '[-3:+C]',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E]',
    pizz: '[-3:E]',
    '>': '[,-3:D] 120=V', //comma will revert key switch after a single note
    '_':  '[,-3:C]'
  }
};

module.exports = annotations;