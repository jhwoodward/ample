
module.exports = function (ngModule) {

  ngModule.directive('macroList', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./macro-list.html'),
      scope: {
        macros: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', 'songService', '$state', '$mdDialog', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, songService, $state, $mdDialog) {
    var vm = this;

    $scope.$watchCollection('vm.macros', function () {

      if (!vm.macros) {
        vm.annotations = [];
        vm.articulations = [];
        vm.substitutions = [];
        vm.animations = [];
      } else {
        vm.annotations = vm.macros.filter(m => m.type === 'annotation');
        vm.articulations = vm.macros.filter(m => m.type === 'articulation');
        vm.substitutions = vm.macros.filter(m => m.type === 'substitution');
        vm.animations = vm.macros.filter(m => m.type === 'animation');
      }
    });


  }

}
