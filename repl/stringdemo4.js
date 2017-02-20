var make = require('../src/ample').make;
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var ensembles = require("../src/ensembles");
var instruments = require("../src/instruments/all");

var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(ensemble, performer, true)
utils.addPlayer(players,instruments.woodwind.clarinet.performers.herring, 'clarinet');
utils.addPlayer(players,instruments.woodwind.clarinet.performers.herring, 'voice');

var rules = {
  'p1a': '1:24, {spiccato}  >eG>eG>eG>eG {pizzicato} fGfGfGfG {bartok} eGeGeGeG {collegno} fGfGfGfG {staccato} eGeGeGeG  fGfGfGfG  ', 
  'p2a': '1:24, {spiccato}  cbCbCbCb  DcDcDcDc cbCbCbCb DcDcDcDc  cbCbCbCb  DcDcDcDc', // 24 x 6 = 144... 48
  'p3a': '0:36, {spiccato}  gAB gAB gAB gAB  gAB gAB gAB BCa BCa BCa BC ', //36 x 4 = 144... 32
  'p4a': '-1:48,{spiccato}  C^G^      C^G^    -1:C^G^   C^G^      -1:C^G^   C^G^ ',// 24 
  'p4b': '-1:36,{spiccato}  C^G^      C^G^    -1:C^G^   C^G^       ',//16 x 36 / 48 =  12
  'clar1': '48, 40=C11 //// //// 1:G/// 12, eGeGeGeGe 24, G/A// 18, fEfEfEfEf 48, ec/^ag////^/ 18, fEfEfEfEfEfE///////////24,FG 48,A/^///fb/////',
  'violin1': 'p1a p1a p1a p1a p1a      p1a 0@ p1a  ^',
  'violin2': 'p2a p2a p2a p2a p2a   3@  p2a p2a  ^',
  'viola': ' p3a p3a p3a p3a p3a     p3a p3a ^',
  'cello': 'p4a p4a p4a p4a      p4b p4b p4a p4b^',
  'voice1' : '48,1:b/g///E/b/g////^',
  'voice2' : '48,1:b/g///E/b/g/A//^',
  'voice3' : '36,1://a//Gecb///g',
  '4rest' : '48,//// //// //// //// ',
  //'part5': '48, //// //// //// //// 1:G/// 18, eDFGd//c//g////////6,fe-edca-ad/c/-b/a//24, GC//DE//G-B///12,ag//eD///c//^',
  //'clarinet': '48, 40=C11 //// //// 1:G/// 18, 24,fedcbCDEg///A///B///C///////36,CDEb/CDEc////^' 
  'clarinet': 'clar1 ^ 48,/// ^/ clar1 18,C/D/E^c/D/EGC////// 80=C11 ^a^C^g^D^e^c^aBC^aBC^Gfe^Gfe^Geb/CE+GAC///^//////////////////////////g/////////////^',
  'voice': '48,1: 4rest voice1 4rest voice2 voice2 voice2 4rest voice3 voice3 voice3 voice3 voice2 //////^ '
};

var conductor = {
  1: key.cmaj + ' 144=T',
  17: key.emaj, // + ' 113=T',
  29: key.dmaj,// + ' 153=T',
  32: key.aflat,
  48: key.dflat,
  64: key.cmaj,
  97: key.dflat,
  121: key.cmaj,
  129: key.cmaj
};

utils.addRudiments(rules);

//make({ name: 'stringdemo2', players: players }, rules, conductor).play();

module.exports = {
  players: players,
  rules: rules,
  conductor: conductor
};
