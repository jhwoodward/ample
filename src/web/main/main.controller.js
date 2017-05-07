var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var Sequencer = require('./Sequencer.js');
var InfoLogger = require('../InfoLogger');
var beautify_js = require('js-beautify').js_beautify

module.exports = function (ngModule) {
  ngModule.controller('mainController', ['$scope', '$timeout', 'storeService', '$mdSidenav', '$mdPanel', '$mdMenu', '$log', '$state', 'song', controller]);
}


function controller($scope, $timeout, storeService, $mdSidenav, $mdPanel, $mdMenu, $log, $state, song) {
  var vm = this;

  vm.brand = 'Scriptophonics';
  vm.song = song;
  vm.tracks = songToArray(vm.song);

  vm.save = save;
  vm.delete = del;
  vm.new = function () {
    if (!vm.song.created) {
      vm.song = storeService.new();
      vm.tracks = songToArray(vm.song);
    } else {
      $state.go('root', { key: undefined });
    }
  }
  vm.toggleRight = function() {
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

  var autoScroll;
  var logElement;
  $timeout(function () {
    logElement = document.getElementById('log');
  });
  function scrollToBottom() {
    logElement.scrollTop = logElement.scrollHeight
  }
  function startScrollLogWindow() {
    window.clearInterval(autoScroll);
    autoScroll = window.setInterval(scrollToBottom, 100);
  }
  function stopScrollLogWindow() {
    window.clearInterval(autoScroll);
  }


  function songToArray(song) {
    var out = [];
    for (var key in song.parts) {
      out.push({
        key,
        part: song.parts[key].part,
        sub: song.parts[key].sub,
        channel: song.parts[key].channel
      });
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



  //var logger = new InfoLogger(onLogInfo);

  vm.sequencer = new Sequencer();
  vm.sequencer.subscribe(handleEvent);
  vm.sequencer.init(function (output) {
    console.log('output', output);
  });

  function handleEvent(e) {
    if (e.type === 'end') {
      vm.stop();
    }
  }

  vm.play = function (song) {
    var tracks;
    if (song) {
      tracks = song.parts;
    } else {
      tracks = songFromArray(vm.tracks);
    }
    vm.info = [];
    vm.pianoRoll = [];
    startScrollLogWindow();
    vm.sequencer.load(tracks).start();
    vm.playing = true;
  }

  $scope.$on('play', function (event, song) {
    vm.play(song);
  });
  $scope.$on('stop', function () {
    vm.stop();
  });

  vm.playing = false;

  vm.togglePause = function () {
    if (vm.sequencer.paused) {
      startScrollLogWindow();
      vm.playing = true;
    } else {
      stopScrollLogWindow();
      vm.playing = false;
    }
    vm.sequencer.togglePause();
  }

  vm.stop = function () {
    $timeout(function () {
      $scope.$apply(function () {
        stopScrollLogWindow();
        vm.sequencer.stop();
        vm.playing = false;
        /*
        vm.pianoRoll = [];
        vm.info = [];
        */
      });
    });

  }



  vm.info = [];

  function onLogInfo(e) {
    handleEvent(e);
    $timeout(function () {
      $scope.$apply(function () {
        vm.info.push(e.data);
      });
    })
  }


}


