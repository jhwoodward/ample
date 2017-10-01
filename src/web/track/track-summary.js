
module.exports = function (ngModule) {

  ngModule.directive('trackSummary', [function () {
    return {
      restrict: 'E',
      template: require('./track-summary.html'),
      scope: {
        sequencer: '=',
        track: '=',
        collapsed: '=',
        panelIndex: '=',        
        onEdit: '&'
      },
      bindToController: true,
      controller: ['$scope', '$timeout', 'macroListService','$mdSidenav', 'stateService', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, macroListService, $mdSidenav, state) {
    var vm = this;
    vm.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    vm.showChannelDropdown = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };

    vm.selectChannel = function (channel) {
      vm.track.channel = channel - 1;
    }

    vm.edit = function () {
      state.selectedTrack = vm.track;
      $mdSidenav('editTrack').toggle();
    }

  }

}

