
module.exports = function (ngModule) {

  ngModule.directive('editTrack', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./edit-track.html'),
      scope: {
        isOpen: '=',
        track: '=',
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', 'userService', 'macroListService', '$state', '$mdDialog', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, userService, macroListService, $state, $mdDialog) {
    var vm = this;

    $scope.$watch('vm.isOpen', function (open) {
      if (open) {
        activate();
      }
    })

    function activate() {

      vm.ownMacros = vm.track.interpreted.macros.filter(m => m.isOwn);
      vm.masterMacros = vm.track.interpreted.macros.filter(m => m.isMaster);
      vm.importedMacros = vm.track.interpreted.macros.filter(m => !m.isMaster && !m.isOwn);


      macroListService.getAll(userService.user.key).then(function (items) {
        vm.macroLists = items;
      });
   

    }

    vm.import = function(macroList) {
      vm.track.imports = vm.track.imports || [];

      vm.track.imports.push(macroList);

      vm.track.macros = vm.track.macros.concat(macroList.macros);


    }

    vm.saveMacroList = function () {
      $mdDialog.show({
        template: require('./macro-list-save.html'),
        controller: 'MacroListController',
        resolve: {
          macros: function () {
            return vm.ownMacros;
          }
        }
        ,
        controllerAs: 'vm',
        parent: angular.element(document.body),
        clickOutsideToClose: false
      });
    }


  }

}
