
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
      controller: ['$scope', '$mdSidenav', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav) {
    var vm = this;
    vm.close = function () {
      $mdSidenav('options').close();
    };

    $scope.$watch('vm.isOpen', function (open) {
      if (open) {
        activate();
      }
    })

    function activate() {


    }







  }

}
