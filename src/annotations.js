
var annotations = {
  brass: {
    trumpet: {
      cinesamples: { //VELOCITY MAP setting
        legato: '20=C3 127=C64 -7=ON 5=OFF 40=C1',
        detached4: '20=C3 127=C64 0=ON  -15=OFF  40=C1',
        detached2: '20=C3 127=C64  0=ON  -20=OFF  40=C1',
        staccato: '50=V  0=C64 10=C1',// 0.5=LEN ? harcoded for now
        staccato8: '50=V  0=C64  10=C1',
        staccato4: '100=V  0=C64 10=C1',
        staccato2: '120=V  0=C64 10=C1',
      },
      chapman: {//CC11 = volume, CC1 = vibrato
        legato: '[-2:C] -12=ON 2=OFF ',//this instrument always requires legato -9 at the beginning of the phrase
        detached: '[-2:C] 0=ON -7=OFF',
        staccato: '[-2:+D]  ',
        accent: '120=V'
      }
    },
    horn: {
      cinesamples: { //VELOCITY MAP setting
        legato: '20=C3 127=C64 -1=ON 1=OFF ',
        detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
        detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
        staccato: '50=V  0=C64 10=C1',// 0.5=LEN ? harcoded for now
        staccato8: '50=V  0=C64 10=C1 ',
        staccato4: '100=V  0=C64 10=C1',
        staccato2: '120=V  0=C64 10=C1',
      }
    },
    trombone: {
       cinesamples: { //VELOCITY MAP setting
        legato: '20=C3 127=C64 -1=ON 1=OFF ',
        detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
        detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
        staccato: '50=V  0=C64 ',// 0.5=LEN ? harcoded for now
        staccato8: '50=V  0=C64  ',
        staccato4: '100=V  0=C64 ',
        staccato2: '120=V  0=C64 ',
      }
    },
    tuba: {
       cinesamples: { //VELOCITY MAP setting
        legato: '20=C3 127=C64 -1=ON 1=OFF ',
        detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
        detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
        staccato: '50=V  0=C64 ',// 0.5=LEN ? harcoded for now
        staccato8: '50=V  0=C64  ',
        staccato4: '100=V  0=C64 ',
        staccato2: '120=V  0=C64 ',
      },
      chapman: {//CC11 = volume, CC1 = vibrato
        legato: '[-2:C] -12=ON 2=OFF ',//this instrument always requires legato -9 at the beginning of the phrase
        detached: '[-2:C] 0=ON -7=OFF',
        staccato: '[-2:+D]  ',
        accent: '120=V'
      }
    }
  },
  woodwind: {
    clarinet: {
      herring: { //CC11 = volume, CC1 = vibrato
        legato: '[-2:C] -5=ON 5=OFF ',
        detached: '[-2:C] 0=ON -7=OFF',
        staccato: '[-2:D]  120=V',// 0.5=LEN ? harcoded for now
        staccato8: '[-2:D] 20=V '
      },
      diamanti: {
        staccato: '[-3:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        staccatosoft: '[-3:+D]  50=C1',
        staccatotight: '[-3:E]  50=C1',
        detached: '[-3:C] 0=ON -5=OFF  50=C1',
        legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:+C] -7=ON 5=OFF  50=C1',
        accent: '120=C1 16000=P 120=V'
      }
    },
    bassoon: {
      fattori: {
        staccato: '[-3:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        detached: '[-3:C] 0=ON -5=OFF  50=C1',
        legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:D] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    },
    oboe: {
      lovecchio: {
        staccato: '[-2:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        detached: '[-2:C] 0=ON -5=OFF  50=C1',
        legato: '[-2:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-2:D] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    },
    flute: {
      maratti: {
        staccato: '[-2:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        staccatotight: '[-2:A]   50=C1',
        detached: '[-2:C] 0=ON -5=OFF  50=C1',
        legato: '[-2:C] -7=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-1:F] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    }
  },
  strings: {
    violin: {
      triobroz: {
        staccato: '[-3:+D]',
        detached: '[-3:C] 8192=P 0=ON -5=OFF',
        legato: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
        spiccato: '[-3:D]',
        spic: '[-3:D]',
        pizzicato: '[-3:E] 50=V',
        pizz: '[-3:E]',
        accent: '120=V',
        glissando: '0=P'
      },
      friedlander: {
        legato: '[-1:F] 127=C15 0=C14  -13=ON 1=OFF 0=C17',//keyswitch -1:F = legato mode, C15=slur, C14 = porta, CC17 = legato transition speed
        legatoquick: '[-1:F] 127=C15 0=C14  -6=ON 1=OFF 80=C17',//keyswitch -1:F = legato mode, C15=slur, C14 = porta, CC17 = legato transition speed
        detached: ' [-1:F]  0=C15 0=C14  0=ON  -7=OFF',
        staccato: '[-1:A]  0=C14 ',// 0.5=LEN ? harcoded for now
        pizzicato: '[-1:+A]  0=C14 ',
        accent: '120=V',
        glissando: '127=C14'
      }
    },
    viola: {
      triobroz: {
        staccato: '[-3:+D]',
        detached: '[-3:C] 8192=P 0=ON -5=OFF',
        legato: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
        spiccato: '[-3:D]',
        spic: '[-3:D]',
        pizzicato: '[-3:E] 50=V',
        pizz: '[-3:E]',
        accent: '120=V',
        glissando: '0=P'
      }

    },
    cello: {
      triobroz: {
        staccato: '[-3:+D]',
        detached: '[-3:C] 8192=P 0=ON -5=OFF',
        legato: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
        spiccato: '[-3:D]',
        spic: '[-3:D]',
        pizzicato: '[-3:E] 50=V',
        pizz: '[-3:E]',
        accent: '120=V',
        glissando: '0=P'
      },
      tinaguo: {

      }

    },
    bass: {

    }

  }



};

module.exports = annotations;