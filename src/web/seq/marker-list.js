
module.exports = function (ngModule) {

  ngModule.directive('markerList', [function () {
    return {
      restrict: 'E',
      template: require('./marker-list.html'),
      scope: {
        sequencer: '=',
      },
      bindToController: true,
      controller: controller,
      controllerAs: 'vm'
    }
  }]);

  function controller() {
    var vm = this;

  
  }

}
