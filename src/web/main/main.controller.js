var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var Sequencer = require('./Sequencer.js');
var beautify_js = require('js-beautify').js_beautify

module.exports = function (ngModule) {
  ngModule.controller('mainController', ['$scope', '$timeout', 'storeService', '$mdSidenav', '$mdPanel', '$mdMenu', '$mdToast', '$log', '$state', 'song', 'webMidiService', controller]);
}


function controller($scope, $timeout, storeService, $mdSidenav, $mdPanel, $mdMenu, $mdToast, $log, $state, song, webMidiService) {
  var vm = this;

  vm.brand = 'Scriptophonics';
  vm.song = song;
  vm.tracks = songToArray(vm.song);

  vm.sequencer = new Sequencer(webMidiService.selectedOutput);
  vm.sequencer.subscribe(handleEvent);
  vm.sequencer.load(vm.tracks);

  vm.save = save;
  vm.delete = del;
  vm.new = function () {
    if (!vm.song.created) {
      vm.song = storeService.new();
      vm.tracks = songToArray(vm.song);
      vm.sequencer.load(vm.tracks);
    } else {
      $state.go('root.main', { key: undefined });
    }
  }
  vm.toggleRight = function () {
    $mdSidenav('right').toggle();
  }
  vm.isOpenRight = function () {
    return $mdSidenav('right').isOpen();
  };

  function save() {
    vm.song.parts = songFromArray(vm.tracks);
    storeService.save(vm.song).then(function (result) {
      console.log(result);
    });
  }

  function del() {
    storeService.delete(vm.song.key).then(function (result) {
      console.log(result);
    });
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
      index ++;
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


  vm.togglePause = function () {
    vm.sequencer.togglePause();
  }

  vm.stop = function () {
    vm.sequencer.stop();
  }

}
