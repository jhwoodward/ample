var PianoRollLogger = require('./PianoRollLogger');
module.exports = function (ngModule) {

  ngModule.directive('pianoRoll', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-roll.html'),
      scope: {
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout) {
    var vm = this;
    var logger = new PianoRollLogger(callback);
    vm.data = [];
    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(logger.handler);
      }
    });

    function callback(e) {
      // convert pitch object to array
      var arr = [];
      for (var i = 0; i < 128; i++) {
        arr.push(e.pitch[i]);
      }
      e.pitch = arr.reduce(function (acc, item) {
        if (item) {
          // acc += '<i class="ion-record" ></i>';
          acc += '<span class="channel' + item + '">█</span>';
        } else {
          acc += '·';
        }
        return acc;
      }, '');

      $timeout(function () {
        $scope.$apply(function () {
          vm.data.push(e);
        });
      })
    }
  }

}
