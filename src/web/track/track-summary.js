
module.exports = function (ngModule) {

  ngModule.directive('trackSummary', [function () {
    return {
      restrict: 'E',
      template: require('./track-summary.html'),
      scope: {
        sequencer: '=',
        track: '=',
        panelIndex: '=',        
        onEdit: '&'
      },
      bindToController: true,
      controller: ['$scope', '$timeout', 'macroListService', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, macroListService) {
    var vm = this;
    vm.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    vm.showChannelDropdown = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };

    vm.selectChannel = function (channel) {
      vm.track.channel = channel - 1;
    }

  }

}

