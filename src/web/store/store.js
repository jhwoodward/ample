
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
    vm.load = function (song) {
      $state.go('root.main', { key: song.key });
    }
    vm.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.info("close RIGHT is done");
        });
    };

    var playing = false;
    vm.togglePlay = function (song) {
      if (!playing) {
        $rootScope.$broadcast('play', song);
        playing = true;
      } else {
        $rootScope.$broadcast('stop', song);
        playing = false;
      }

    }
  }

}
