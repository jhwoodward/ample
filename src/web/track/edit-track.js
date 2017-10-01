
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
    });

    function activate() {
      macroListService.getAll(userService.user.key).then(function (items) {
        if (!items) { return; }
        items = items.map(macroList => {
          var source = macroList.owner + '/' + macroList.key;
          macroList.selected = vm.track.imports.indexOf(source) > -1;
          return macroList;
        });
        vm.macroLists = items;
      });
    }

    vm.setImports = function () {
      vm.track.imports = [];
      vm.track.macros = [];
      vm.track.interpreted.macros = vm.track.interpreted.macros.filter(m => m.source === 'default' || m.source === 'self' || m.source === 'master');

      vm.macroLists.filter(m => m.selected).forEach(macroList => {
        var source = macroList.owner + '/' + macroList.key;
        vm.track.imports.push(source);
        macroListService.getOne(macroList.key, macroList.owner).then(function (loaded) {
          loaded.macros = loaded.macros.map(m => {
            m.source = source;
            return m;
          });
          vm.track.macros = vm.track.macros.concat(loaded.macros);
          vm.track.interpreted.macros = vm.track.interpreted.macros.concat(loaded.macros);
        });
      });
    }

    

    vm.saveMacroList = function () {
      $mdDialog.show({
        template: require('./macro-list-save.html'),
        controller: 'MacroListController',
        resolve: {
          macros: function () {
            return vm.track.interpreted.macros.filter(m => m.source === 'self');
          }
        },
        controllerAs: 'vm',
        parent: angular.element(document.body),
        clickOutsideToClose: false
      });
    }
  }
}
