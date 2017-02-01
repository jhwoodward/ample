module.exports = {
  triobroz: {
    name: 'triobroz',
    /*
      dynamics:
    */
    default: '[-3:C] 110=C1 8192=P 0=ON -5=OFF',
    staccato: '[-3:+D]',
    detached: '[-3:C] 8192=P 0=ON -5=OFF',
    legatoslow: '[-3:C] 8192=P -12=ON 1=OFF 70=C17 50=C18',
    legatoquick: '[-3:C] 8192=P -3=ON 1=OFF 127=C17 0=C18',
    legato: '[-3:C] 8192=P -7=ON 5=OFF',
    'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
    spiccato: '[-3:D]',
    spic: '[-3:D]',
    pizzicato: '[-3:E] 50=V',
    pizz: '[-3:E]',
    accent: '120=V',
    portamento: '0=P'
  },
  sacconi: {
    name: 'sacconi',

    vibrato: {
      trigger: 'noteon',
      c: 103,
      values: {
        0: 0,
        48: 100
      }
    },
    swellnote: {
      trigger: 'noteon',
      c: 11,
      values: {
        12: '+10',
        24: '+10',
        48: '+10',
        72: '-10',
        84: '-10',
        96: '-10'
      }
    },
    swellphrase96: {
      // trigger: 'noteon',
      c: 11,
      values: {
        12: '+10',
        24: '+10',
        36: '+10',
        48: '+10',
        60: '-10',
        72: '-10',
        84: '-10',
        96: '-10'
      }
    },
    swellphrase192: {
      // trigger: 'noteon',
      c: 11,
      values: {
        24: '+10',
        48: '+10',
        72: '+10',
        96: '+10',
        120: '-10',
        144: '-10',
        168: '-10',
        196: '-10'
      }
    },
    /*
      dynamics: C11 mod wheel
      vibrato: C104
      expression: expression pedal
      portamento: low velocity
    */
    //  default: '100=V 100=C1 0=C14 0=C15  -10=ON 1=OFF  ',
    default: {
      velocity: 100,
      controller: { 1: 100, 14: 0, 15: 0 },
      on: -10,
      off: 1
    },
    //  portamento: '10=V'
    portamento: {
      velocity: 10
    }
  },
  cinestrings: {
    name: 'cinestrings'
  }
}