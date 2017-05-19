
module.exports = function (ngModule) {

  ngModule.directive('store', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./store.html'),
      scope: {
      },
      bindToController: true,
      controller: ['$scope', '$timeout', 'storeService', '$mdSidenav', '$rootScope', '$state', '$log', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, storeService, $mdSidenav, $rootScope, $state, $log) {
    var vm = this;


    storeService.getAll().then(function (songs) {
      vm.songs = songs;
    });

    vm.new = function () {
       $state.go('root.main', { key: '0' }, {reload: true });
       vm.close();
       /*
      if (!currentSong || !currentSong.created) {
        vm.song = storeService.new();
        // vm.tracks = songToArray(vm.song);
        vm.sequencer.load(vm.song.tracks);
      } else {
        $state.go('root.main', { key: undefined });
      }
      */
    }

    vm.load = function (song) {
      $state.go('root.main', { key: song.key });

    }
    vm.close = function () {
      $mdSidenav('store').close()
        .then(function () {
          $log.info("close RIGHT is done");
        });
    };


  }

}
