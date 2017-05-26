
module.exports = function (ngModule) {

  ngModule.directive('options', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./options.html'),
      scope: {
        isOpen: '=',
        log: '=',
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', 'userService', '$rootScope', '$mdDialog', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, userService, $rootScope, $mdDialog) {
    var vm = this;
    vm.close = function () {
      $mdSidenav('options').close();
    };

    $scope.$watch('vm.isOpen', function (open) {
      if (open) {
        activate();
      }
    });

    $scope.$on('login', activate);

    vm.isLoggedIn = userService.isLoggedIn();


    function activate() {
      vm.isLoggedIn = userService.isLoggedIn();
    }


    vm.signup = function (ev) {
      $mdDialog.show({
        template: require('../user/signup.html'),
        controller: 'SignupController',
        controllerAs: 'vm',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      }).then(function () {
          $mdSidenav('options').close();
        });
    }

    vm.login = function (ev) {
      $mdDialog.show({
        template: require('../user/login.html'),
        controller: 'LoginController',
        controllerAs: 'vm',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      }).then(function () {
        $mdSidenav('options').close();
      });
    }



    vm.logout = function () {
      userService.logout();
      vm.isLoggedIn = false;
      $rootScope.$broadcast('login');
      $mdSidenav('options').close();
    }







  }

}
