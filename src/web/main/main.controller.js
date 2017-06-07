var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var Sequencer = require('../seq/Sequencer.js');

module.exports = function (ngModule) {
  ngModule.controller('mainController', ['$scope', '$rootScope', '$timeout', 'songService', 'userService', '$mdSidenav', '$mdPanel', '$mdMenu', '$mdToast', '$log', '$state', 'song', '$mdDialog', 'midiService', 'timer', controller]);
}

function controller($scope, $rootScope, $timeout, songService, userService, $mdSidenav, $mdPanel, $mdMenu, $mdToast, $log, $state, song, $mdDialog, midiService, timer) {
  var vm = this;

  if (userService.user.key === 'guest') {
    showTutorialDialog();
  }

  //if (!song) {
  //  $state.go('root.new');
  //}
  vm.song = $rootScope.song = song;

  if (!vm.song.master) {
    vm.song.master = {
      part: ''
    };
  }



  if (!vm.song.created) {
    $timeout(function () {
      $mdSidenav('editSong').open();
    });
  }

  $rootScope.user = userService.user;
  $scope.$on('login', function () {
    $rootScope.user = userService.user;
  });

  vm.log = 'roll';

  vm.sequencer = new Sequencer(midiService.selectedOutput, timer);
  vm.sequencer.subscribe(handleEvent);
  $scope.$on('$destroy', function () {
    console.log('scope destroy');
    vm.sequencer.unsubscribeAll();
  });

  $timeout(function () {
    vm.sequencer.load(vm.song.tracks, vm.song.master);
  }, 100);

  vm.toggleStore = function () {
    $mdSidenav('store').toggle();
  }
  vm.editSong = function () {
    $mdSidenav('editSong').toggle();
  }
  vm.editTrack = function (track) {
    vm.selectedTrack = track;
    $mdSidenav('editTrack').toggle();
  }

  vm.toggleOptions = function () {
    $mdSidenav('options').toggle();
  }

  vm.editSongOpen = function () {
    return $mdSidenav('editSong').isOpen();
  }
  vm.editTrackOpen = function () {
    return $mdSidenav('editTrack').isOpen();
  }

  vm.storeOpen = function () {
    return $mdSidenav('store').isOpen();
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

  vm.clone = function () {
    return songService.clone(vm.song).then(function (song) {
      $state.go('root.main', { key: song.key, owner: song.owner });
    })
  };

  vm.new = function () {
    $state.go('root.new');
    //vm.close();
    /*
   if (!currentSong || !currentSong.created) {
     vm.song = songService.new();
     // vm.tracks = songToArray(vm.song);
     vm.sequencer.load(vm.song.tracks);
   } else {
     $state.go('root.main', { key: undefined });
   }
   */
  }

  vm.play = function () {
    vm.sequencer.start();
  }

  vm.goTo = function (marker) {
    vm.sequencer.goToMarker(marker);
  }

  function showTutorialDialog() {
    $mdDialog.show({
      template: require('../tutorial/notation.html'),
      controller: 'NotationController',
      controllerAs: 'vm',
      parent: angular.element(document.body),
      clickOutsideToClose: false
    });
  }

  vm.togglePause = function () {
    vm.sequencer.togglePause();
  }

  vm.stop = function () {
    vm.sequencer.stop();
  }

}
