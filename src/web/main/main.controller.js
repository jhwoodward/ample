var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var Sequencer = require('./Sequencer.js');
var beautify_js = require('js-beautify').js_beautify

module.exports = function (ngModule) {
  ngModule.controller('mainController', ['$scope', '$timeout', 'storeService', '$mdSidenav', '$mdPanel', '$mdMenu', '$mdToast', '$log', '$state', 'song', 'webMidiService', '$mdDialog', controller]);
}


function controller($scope, $timeout, storeService, $mdSidenav, $mdPanel, $mdMenu, $mdToast, $log, $state, song, webMidiService, $mdDialog) {
  var vm = this;

  vm.song = song;
  if (!vm.song.master) {
    vm.song.master = {
      part: ''
    };
  }

  vm.log = 'roll';

  if (!vm.song.tracks) {
    vm.song.tracks = songToArray(vm.song);
    delete vm.song.parts;
  }

  vm.sequencer = new Sequencer(webMidiService.selectedOutput);
  vm.sequencer.subscribe(handleEvent);

  $timeout(function () {
    vm.sequencer.load(vm.song.tracks, vm.song.master);
  }, 100);

  vm.toggleStore = function () {
    $mdSidenav('store').toggle();
  }
  vm.toggleTracks = function () {
    $mdSidenav('tracks').toggle();
  }
  vm.toggleOptions = function () {
    $mdSidenav('options').toggle();
  }

  vm.tracksOpen = function () {
    return $mdSidenav('tracks').isOpen();
  }

  function songToArray(song) {
    var out = [];
    var index = 0;
    for (var key in song.parts) {
      out.push({
        index,
        key,
        part: song.parts[key].part,
        sub: song.parts[key].sub,
        channel: song.parts[key].channel
      });
      index++;
    }
    return out;

  }

  function songFromArray(tracks) {
    var out = {};
    tracks.forEach(t => {
      out[t.key] = {
        channel: t.channel,
        sub: t.sub,
        part: t.part,
      }
    });
    return out;
  }

  function songToString(song) {
    return beautify_js(JSON.stringify(song).replace(/\\n/g, '').replace(/\\t/g, ''), { indent_size: 2 });
  }



  function handleEvent(e) {
    if (e.type === 'end') {
      vm.stop();
    }
    /*
    if (e.type === 'info') {
      $mdToast.show(
        $mdToast.simple()
          .textContent(e.info)
          .position('bottom right')
          .hideDelay(3000)
      );
    }
    */
  }

  vm.play = function () {
    vm.sequencer.start();
  }

  vm.goTo = function(marker) {
    vm.sequencer.markers.forEach(m => {
      m.active=false;
    });
    marker.active =true;
    vm.sequencer.tick = marker.tick;
    if (!vm.sequencer.playing) {
      vm.sequencer.play();
    }
  }

 




  vm.togglePause = function () {
    vm.sequencer.togglePause();
  }

  vm.stop = function () {
    vm.sequencer.stop();
  }

}
