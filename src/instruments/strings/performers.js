module.exports = {
  triobroz: {
    name: 'triobroz',
    /*
      dynamics:
    */
    default: '[-3:C] 90=C1 8192=P 0=ON -5=OFF',
    staccato: '[-3:+D]',
    detached: '[-3:C] 8192=P 0=ON -5=OFF',
    legatoslow: '[-3:C] 8192=P -12=ON 1=OFF 70=C17 50=C18',
    legatoquick: '[-3:C] 8192=P -3=ON 1=OFF 127=C17 0=C18',
    legato: '[-3:C] 90=C1  8192=P -10=ON 1=OFF',
    'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
    spiccato: '[-3:D]  0=ON -5=OFF',
    spic: '[-3:D] 0=ON -5=OFF',
    pizzicato: '[-3:E] 50=V',
    pizz: '[-3:E]',
    accent: '120=C1 16383=P',
    portamento: '0=P  -10=ON 1=OFF'
  },
  sacconi: {
    playable: {
      name: 'sacconi-playable',
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

    individual: {
      name: 'sacconi-individual',
      default: '90=V 100=C11 100=C1',
      accent: '120=V',
      spiccato: '[-3:C]',
      staccato: '[-3:+C]',
      pizzicato: '[-3:D]',
      bartok: '[-3:+D]',
      collegno: '[-3:E]',
      harmshort: '[-3:F]',
      long: '[-3:+F]',
      marcato: '[-3:G]',
      flautlong: '[-3:+G]',
      harmlong: '[-3:A]',
      tremolo: '[-3:-B]',
      trem2: '[-3:B]',
      trillmin: '[-2:C]',
      trillmaj: '[-2:+C]'
    }
  }
  ,
  cinestrings: {
    name: 'cinestrings'
  }
}