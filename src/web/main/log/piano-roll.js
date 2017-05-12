var PianoRollLogger = require('./PianoRollLogger');
module.exports = function (ngModule) {

  ngModule.directive('pianoRoll', ['$compile', '$timeout', function ($compile, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-roll.html'),
      scope: {
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {

      var logger = new PianoRollLogger(callback);

      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(logger.handler);
        }
      });

      function scrollToBottom() {
        el[0].scrollTop = el[0].scrollHeight;
      }

      function callback(e) {

        if (e.type !== 'tick') {
          if (e.type === 'start') {
            vm.data = [];
            logger.pitch = {};
          }
          return;
        }
        // convert pitch object to array
        var arr = [];
        for (var i = 0; i < 128; i++) {
          arr.push(e.pitch[i]);
        }
        e.pitch = arr.reduce(function (acc, item) {
          if (item) {
            acc += '<span class="channel' + item.channel + ' track' + item.track + '">█</span>';
          } else {
            acc += '·';
          }
          return acc;
        }, '');

        $timeout(function () {
          scope.$apply(function () {
            vm.data.push(e);
            scrollToBottom();
          });
        })
      }
    }
  }]);



  function controller($scope, ) {
    var vm = this;
    vm.data = [];
  }

}
