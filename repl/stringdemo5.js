var make = require('../src/ample').make;
var utils = require('../src/utils');
var key = require('../src/rudiments').key;
var scale = require('../src/rudiments').scale;
var ensembles = require("../src/ensembles");
var instruments = require("../src/instruments/all");

var ensemble = ensembles.stringQuartet;
var performer = ensembles.stringQuartet.performers.sacconi.individual;
var players = utils.playersFromEnsemble(ensemble, performer, true);
utils.addPlayer(players, instruments.piano, 'piano1');
utils.addPlayer(players, instruments.piano, 'piano2',5);
utils.addPlayer(players, instruments.piano, 'piano3',5);

var rules = {

  p1a: '2:24, {pizzicato} >eee>eee>ee  >fGf>GfG>fG  f>GfG>fGf>G  ', 
  violin1: 'p1a p1a 4@ p1a p1a p1a      p1a 0@ p1a  ^', 

  p2a: '1:24, {pizzicato} //////// >dbD>bDb>Db  D>bDb>DbD>b ', // 24 x 6 = 144... 48
  violin2:'p2a p2a -4@ p2a p2a p2a   3@  p2a p2a  ^',

  p3a: '1:32, {pizzicato} cEbEaFgBD  cEdFGbCG  cDEFGAfd', //36 x 4 = 144... 32
  viola: 'p3a p3a p3a p3a p3a p3a p3a ^',

  p4a: '-1:48,{pizzicato} C//g C//g ',// 8 beats
  p4b: '-1:24,{pizzicato} C//g//// C//G//// ',// 8 beats
  cello: 'p4a p4b 5@ p4a 0@ p4b  7@    p4a p4b 0@ p4a p4b ^',

  pia1a: '1: 24, {pedaldown} cD//E ^ cG-B {pedalup} G/A/ //Cg-ee/C>CC^',
  pia3a: '-1: 16, c/// E//G/>A/g',
  pia3b: '-1: 16, f/// A//C/>D/c',
  pia3c: '-1: 16, g///-BB//D/Ed',
  piano1: 'pia1a pia1a pia1a pia1a pia1a pia1a',
  piano2: '3@ pia1a 4@ pia1a 5@ pia1a 6@ pia1a 2@ pia1a -3@ pia1a ',
 // piano3: 'pia3a pia3a pia3a pia3a pia3b pia3b pia3a pia3a pia3c pia3b pia3c pia3b pia3c pia3b pia3a pia3a ^'
};

var conductor = {
  1: scale.cblues + ' 144=T',
  17: scale.fblues,
  25: scale.cblues,
  33: scale.gblues,
  37: scale.fblues,
  41: scale.gblues,
  45: scale.fblues,
  49: scale.gblues,
  53: scale.fblues,
  58: scale.cblues

};


utils.addRudiments(rules);

//make({ name: 'stringdemo2', players: players }, rules, conductor).play();

module.exports = {
  players: players,
  rules: rules,
  conductor: conductor
};
