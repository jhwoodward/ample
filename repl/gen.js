var make = require('../src/ample').make;
var utils = require('../src/utils');
var loop = utils.loop;

var rules = {
  'phrase1': '48, ^///',
  'phrase2': '48, ^//',
  'phrase3': '24, ^///',
  'part1': 'phrase1',
  'player1': 'part1 part1 part1 part1 part1 part1 part1 part1 part1 ',
  'part2': 'phrase2',
  'player2': 'part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 part2 ',
  'part3': 'phrase3',
  'player3': 'part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 part3 '
};

var conductor = {
  '1': 'K()K 144=T',
  '17': 'K(+f+c+g+d)K',
  '29': 'K(+f+c)K',
  '32': 'K(-b-e-a-d)K',
  '48': 'K(-b-e-a-d-g)K',
  '64': 'K()K',
  '97': 'K(-b-e-a-d-g)K',
  '121': 'K()K',
  '129': 'K()K'
};

var players = [
  {
    'name': 'violin (sacconi-individual)',
    'part': 'violin1',
    'channel': 0,
    'annotations': {
      'default': '90=V 100=C11 100=C1',
      'staccato': '[-3:+C]',
      'detached': '',
      'legatoslow': '',
      'legatoquick': '',
      'legato': '',
      'spiccato': '[-3:C]',
      'spic': '',
      'pizzicato': '[-3:D]',
      'pizz': '',
      'accent': '120=V',
      'portamento': '',
      'name': 'sacconi-individual',
      'bartok': '[-3:+D]',
      'collegno': '[-3:E]',
      'harmshort': '[-3:F]',
      'long': '[-3:+F]',
      'marcato': '[-3:G]',
      'flautlong': '[-3:+G]',
      'harmlong': '[-3:A]',
      'tremolo': '[-3:-B]',
      'trem2': '[-3:B]',
      'trillmin': '[-2:C]',
      'trillmaj': '[-2:+C]'
    },
    'id': 0,
    'score': '1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G   1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G   1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G   1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G   1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G        1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G   0@ 1:24, {pizzicato} >fGf>GfG>fG  f>GfG>fGf>G    ^'
  },
  {
    'name': 'violin (sacconi-individual)',
    'part': 'violin2',
    'channel': 1,
    'annotations': {
      'default': '90=V 100=C11 100=C1',
      'staccato': '[-3:+C]',
      'detached': '',
      'legatoslow': '',
      'legatoquick': '',
      'legato': '',
      'spiccato': '[-3:C]',
      'spic': '',
      'pizzicato': '[-3:D]',
      'pizz': '',
      'accent': '120=V',
      'portamento': '',
      'name': 'sacconi-individual',
      'bartok': '[-3:+D]',
      'collegno': '[-3:E]',
      'harmshort': '[-3:F]',
      'long': '[-3:+F]',
      'marcato': '[-3:G]',
      'flautlong': '[-3:+G]',
      'harmlong': '[-3:A]',
      'tremolo': '[-3:-B]',
      'trem2': '[-3:B]',
      'trillmin': '[-2:C]',
      'trillmaj': '[-2:+C]'
    },
    'id': 1,
    'score': '1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b    3@  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b  1:24, {pizzicato} >dbD>bDb>Db  D>bDb>DbD>b   ^'
  },
  {
    'name': 'viola (sacconi-individual)',
    'part': 'viola',
    'channel': 2,
    'annotations': {
      'default': '90=V 100=C11 100=C1',
      'staccato': '[-3:+C]',
      'detached': '',
      'legatoslow': '',
      'legatoquick': '',
      'legato': '',
      'spiccato': '[-3:C]',
      'spic': '',
      'pizzicato': '[-3:D]',
      'pizz': '',
      'accent': '120=V',
      'portamento': '',
      'name': 'sacconi-individual',
      'bartok': '[-3:+D]',
      'collegno': '[-3:E]',
      'harmshort': '[-3:F]',
      'long': '[-3:+F]',
      'marcato': '[-3:G]',
      'flautlong': '[-3:+G]',
      'harmlong': '[-3:A]',
      'tremolo': '[-3:-B]',
      'trem2': '[-3:B]',
      'trillmin': '[-2:C]',
      'trillmaj': '[-2:+C]'
    },
    'id': 2,
    'score': ' 0:36, {spiccato} c   0:36, {spiccato} c   0:36, {spiccato} c   0:36, {spiccato} c   0:36, {spiccato} c       0:36, {spiccato} c   0:36, {spiccato} c   ^'
  },
  {
    'name': 'cello (sacconi-individual)',
    'part': 'cello',
    'channel': 3,
    'annotations': {
      'default': '90=V 100=C11 100=C1',
      'staccato': '[-3:+C]',
      'detached': '',
      'legatoslow': '',
      'legatoquick': '',
      'legato': '',
      'spiccato': '[-3:C]',
      'spic': '',
      'pizzicato': '[-3:D]',
      'pizz': '',
      'accent': '120=V',
      'portamento': '',
      'name': 'sacconi-individual',
      'bartok': '[-3:+D]',
      'collegno': '[-3:E]',
      'harmshort': '[-3:F]',
      'long': '[-3:+F]',
      'marcato': '[-3:G]',
      'flautlong': '[-3:+G]',
      'harmlong': '[-3:A]',
      'tremolo': '[-3:-B]',
      'trem2': '[-3:B]',
      'trillmin': '[-2:C]',
      'trillmaj': '[-2:+C]'
    },
    'id': 3,
    'score': '-1:48,{spiccato} c/// //// //// D/// -1:48,{spiccato} c/// //// //// D/// -1:48,{spiccato} c/// //// //// D/// -1:48,{spiccato} c/// //// //// D///      p4b p4b -1:48,{spiccato} c/// //// //// D/// p4b^'
  }
];

make({ name: 'gen', players: players }, rules, conductor).play();
