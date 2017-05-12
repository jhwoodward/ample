var InfoLogger = require('./InfoLogger');
module.exports = function (ngModule) {

  ngModule.directive('infoLog', ['$compile', '$timeout', function ($compile, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./info-log.html'),
      scope: {
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {

      var logger = new InfoLogger(callback);

      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(logger.handler);
        }
      });

      function scrollToBottom() {
        el[0].scrollTop = el[0].scrollHeight;
      }

      function callback(e) {
        $timeout(function () {
          scope.$apply(function () {
            vm.data.push(e.data);
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
