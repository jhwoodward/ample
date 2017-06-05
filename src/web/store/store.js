
module.exports = function (ngModule) {

  ngModule.directive('store', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./store.html'),
      scope: {
        isOpen: '=',
        song: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', 'storeService', '$mdSidenav', '$rootScope', '$state', '$log', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, storeService, $mdSidenav, $rootScope, $state, $log) {
    var vm = this;


    $scope.$watch('vm.isOpen', function (open) {
      if (open) {
        activate();
      }
    });

    $scope.$on('login', activate);

    function activate() {
      if (storeService.isLoggedIn()) {
        storeService.getAll(storeService.user.key).then(function (songs) {
          vm.songs = songs;
        });
      } 
    }
    
    vm.load = function (song) {
      $state.go('root.main', { key: song.key, owner: song.owner || 'tutorial' });
    }

    vm.close = function () {
      $mdSidenav('store').close()
        .then(function () {
          $log.info("close RIGHT is done");
        });
    };


  }

}
