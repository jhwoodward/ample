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
  console.log(vm.song);

  if (!vm.song.tracks) {
    vm.song.tracks = songToArray(vm.song);
    delete vm.song.parts;
  }
  //

  vm.sequencer = new Sequencer(webMidiService.selectedOutput);
  vm.sequencer.subscribe(handleEvent);


  $timeout(function () {
    vm.animateLogo();
    vm.sequencer.load(vm.song.tracks, vm.song.master);
  }, 100);



/*
  vm.edit = function (ev) {
    $mdDialog.show({
      controller: 'editController',
      controllerAs: 'vm',
      template: require('./edit.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      fullscreen: false,
      resolve: {
        sequencer: function () {
          return vm.sequencer;
        },
        song: function () {
          return vm.song;
        }
      }
    })
      .then(function (answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function () {
        $scope.status = 'You cancelled the dialog.';
      });
  };
*/

  vm.toggleStore = function () {
    $mdSidenav('store').toggle();
  }
  vm.toggleTracks = function () {
    $mdSidenav('tracks').toggle();
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

 // vm.brand = 's c r i p t o p h o n i c s'.split(' ').map(l => {
     vm.brand = 'c a c o p h o n y'.split(' ').map(l => {
    return {
      letter: l
    };
  });

  var animating = false;
  vm.animateLogo = function () {
    if (animating) return;
    animating = true;
    var speed = 50;
    vm.brand.forEach((l, i) => {
      $timeout(function () {
        l.active = true;
        if (i > 0) {
          vm.brand[i - 1].active = false;
        }
      }, speed * i);
    });
    $timeout(function () {
      vm.brand[vm.brand.length - 1].active = false;
      animating = false;

    }, speed * vm.brand.length);
  }


  vm.togglePause = function () {
    vm.sequencer.togglePause();
  }

  vm.stop = function () {
    vm.sequencer.stop();
  }

}
