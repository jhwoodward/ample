
var instrument = {
  brass: {
    trumpet: {
      test: {
        cinesamples: `24,2:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
          12,  eFGA 48, {legato} -B/24,a^
          12, {staccato8} a-BCD 127=L
          48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
          `,
        chapman: `24,1:  {detached}  c_D E_F {staccato} Gfed  {legato} cEdG-Ba {staccato} gf 
          12,  eFGA 48, {legato} -B/ 24,a^
          12, {staccato} >a-BCD 
          48, {detached} -E/ {detached} dc-ba {staccato} gf/^
          `
      },
      annotations: {
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
      }
    },
    horn: {
      test: {
        cinesamples: `24,1:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
          12,  eFGA 48, {legato} -B/24,a^
          12, {staccato8} a-BCD 
          48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
          `
      },
      annotations: {
        cinesamples: { //VELOCITY MAP setting
          default: '40=V 40=C1',
          legato: '20=C3 127=C64 -1=ON 1=OFF ',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
          staccato: '50=V  0=C64 10=C1',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64 10=C1 ',
          staccato4: '100=V  0=C64 10=C1',
          staccato2: '120=V  0=C64 10=C1',
        }
      }

    },
    trombone: {
      test: {

      },
      annotations: {
        cinesamples: { //VELOCITY MAP setting
          default: '40=V 40=C1',
          legato: '20=C3 127=C64 -1=ON 1=OFF ',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
          staccato: '50=V  0=C64 ',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64  ',
          staccato4: '100=V  0=C64 ',
          staccato2: '120=V  0=C64 ',
        }
      }

    },
    tuba: {
      test: {

      },
      annotations: {
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
          default: '40=V 10=C1',
          legato: '[-2:C] -12=ON 2=OFF ',//this instrument always requires legato -9 at the beginning of the phrase
          detached: '[-2:C] 0=ON -7=OFF',
          staccato: '[-2:+D]  ',
          accent: '120=V'
        }
      }

    }
  },
  woodwind: {
    clarinet: {
      test: {
        rules: {
          tune: `cEGe  cE>Gec//^`,
        },
        parts: {
          herring: `24,1:  {legato} 20=C11  cDEF {staccato8} Gfed  {legato} 127=C11 cEdG-Ba {staccato8} gf 
            12,  e_FGA 48, {legato} -B/ 24, a^
            12, {staccato8} a_-BCD 
            48, {legato} -E/ {detached} dc-ba {staccato} gf/^
            `,
          diamant: `24,1: {legato} tune {staccato} tune`
        }

      },
      annotations: {
        herring: { //CC11 = volume, CC1 = vibrato
          default: '[-2:C] 40=V 80=C11 10=C1',
          legato: '[-2:C] -5=ON 5=OFF ',
          detached: '[-2:C] 0=ON -7=OFF',
          staccato: '[-2:D]  120=V',// 0.5=LEN ? harcoded for now
          staccato8: '[-2:D] 20=V '
        },
        diamanti: {
          default: '40=V 50=C1',
          staccato: '[-3:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
          staccatosoft: '[-3:+D]  50=C1',
          staccatotight: '[-3:E]  50=C1',
          detached: '[-3:C] 0=ON -5=OFF  50=C1',
          legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
          'legato-nonvib': '[-3:+C] -7=ON 5=OFF  50=C1',
          accent: '120=C1 16000=P 120=V'
        }
      }

    },
    bassoon: {
      test: {
        rules: {
          tune: `dEGe  dEGed//^`,
          tun2: `cEGecEGec//^`,
        },
        parts: {
          part1: `24,-1: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
        }

      },
      annotations: {
        fattori: {
          default: '40=V 70=C1',
          staccato: '[-3:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
          detached: '[-3:C] 0=ON -5=OFF  50=C1',
          legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
          'legato-nonvib': '[-3:D] -7=ON 5=OFF  50=C1',
          accent: '16000=P 120=V'
        }
      }

    },
    oboe: {
      test: {
        rules: {
          tune: `dE>Ge  d>EGed//^`,
          tun2: `cEGe>cEG>ec//^`,
        },
        parts: {
          part1: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
        }

      },
      annotations: {
        lovecchio: {
          default: '40=V 70=C1',
          staccato: '[-2:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
          detached: '[-2:C] 0=ON -5=OFF  50=C1',
          legato: '[-2:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
          'legato-nonvib': '[-2:D] -7=ON 5=OFF  50=C1',
          accent: '16000=P 120=V'
        }
      }

    },
    flute: {
      test: {
        rules: {
          tune: `dEGe  dEGed//^`,
          tun2: `cEGecEGec//^`
        },
        parts: {
          arts: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`,
          accent: `24,2: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`
        }

      },
      annotations: {
        maratti: {
          default: '40=V 90=C1',
          staccato: '[-2:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
          staccatotight: '[-2:A]   50=C1',
          detached: '[-2:C] 0=ON -5=OFF  50=C1',
          legato: '[-2:C] -7=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
          'legato-nonvib': '[-1:F] -7=ON 5=OFF  50=C1',
          accent: '16000=P 120=V'
        }
      }

    }
  },
  strings: {
    violin: {
      name: 'violin',
      test: {
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
      },
      annotations: {
        triobroz: {
          name: 'triobroz',
          default: '[-3:C] 85=C1 8192=P 0=ON -5=OFF',
          staccato: '[-3:+D]',
          detached: '[-3:C] 8192=P 0=ON -5=OFF',
          legato: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
          legatoslow: '[-3:C] 8192=P -7=ON 5=OFF',//need to split out phrase legato from note legato
          legatononvib: '[-3:+C] -7=ON 5=OFF',
          spiccato: '[-3:D]',
          spic: '[-3:D]',
          pizzicato: '[-3:E] 50=V',
          pizz: '[-3:E]',
          accent: '120=V',
          glissando: '0=P'
        },
        friedlander: {
          name: 'friedlander',
          default: '100=V 100=C1 0=C14 0=C15  -10=ON 1=OFF  ',
          legatoslow: '[-1:F] 127=C15 0=C14  -13=ON 1=OFF 0=C17',//keyswitch -1:F = legato mode, C15=slur, C14 = porta, CC17 = legato transition speed
          legato: '[-1:F] 127=C15 0=C14  -10=ON 1=OFF 80=C17',//keyswitch -1:F = legato mode, C15=slur, C14 = porta, CC17 = legato transition speed
          detached: ' [-1:F]  0=C15 0=C14  0=ON  -7=OFF',
          staccato: '[-1:A]  0=C14 ',// 0.5=LEN ? harcoded for now
          spiccato: '',
          pizzicato: '[-1:+A]  0=C14 ',
          accent: '120=V',
          glissando: '127=C14'
        }
      }

    },
    viola: {
      name: 'viola',
      test: {
        parts: {
          legato: '24,2: {detached} cGc {legato} 12,cDEFGA-B  C//^b~C//^'
        }
      },
      annotations: {
        triobroz: {
          name: 'triobroz',
          staccato: '[-3:+D]',
          default: '[-3:C] 95=C1 8192=P 0=ON -5=OFF',
          detached: '[-3:C] 8192=P 0=ON -5=OFF',
          legatoslow: '[-3:C] 8192=P -12=ON 1=OFF 70=C17 50=C18',
          legatoquick: '[-3:C] 8192=P -3=ON 1=OFF 127=C17 0=C18',
          legato: '[-3:C] 8192=P -9=ON 1=OFF 100=C17 35=C18',//need to split out phrase legato from note legato
          'legato-nonvib': '[-3:+C] -7=ON 5=OFF',
          spiccato: '[-3:D]',
          spic: '[-3:D]',
          pizzicato: '[-3:E] 50=V',
          pizz: '[-3:E]',
          accent: '120=V',
          glissando: '0=P'
        }
      }
    },
    cello: {
      name: 'cello',
      test: {
        parts: {
          stacc: '{staccato} 0:12,cbagfed  {legato} c//^G~c//^'
        }
      },
      annotations: {
        triobroz: {
          name: 'triobroz',
          default: '[-3:C] 110=C1 8192=P 0=ON -5=OFF',
          staccato: '[-3:+D]',
          detached: '[-3:C] 8192=P 0=ON -5=OFF',
          legatoslow: '[-3:C] 8192=P -12=ON 1=OFF 70=C17 50=C18',
          legatoquick: '[-3:C] 8192=P -3=ON 1=OFF 127=C17 0=C18',
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
      }


    },
    bass: {

    }

  }



};

module.exports = instrument;