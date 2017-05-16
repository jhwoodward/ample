
module.exports = function (ngModule) {

  ngModule.directive('pianoKeys', ['$compile', '$timeout', function ($compile, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-keys.html'),
      scope: {
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {
      var octaveCount = 10;
      var octave = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1];
      var keys = [];
      for (var i = 0; i < octaveCount; i++) {
        keys = keys.concat(octave);
      }

      var height = el[0].offsetHeight - 1;

      var whiteKeysBefore = 0;
      var whiteKeyWidth = 30;
      var blackKeyWidth = 25;
      vm.keys = keys.map((k, i) => {
        var out = {
          track: 0,
          pitch: i,
          colour: k,
          width: k === 1 ? whiteKeyWidth : blackKeyWidth,
          height: k === 1 ? height : height - 100,
          active: false,
          left: whiteKeysBefore * (whiteKeyWidth + 2) - (k === 0 ? (whiteKeyWidth / 2) - 1 : 0),
          name: i === 60 ? 'C4' : ''
        };
        whiteKeysBefore += k;
        return out;
      });

    
      $timeout(function() {
         el[0].scrollLeft = el[0].offsetWidth / 3;
      });
    

      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(handler);
        }
      });

      function handler(event) {

        // if (event.trackIndex !== vm.trackIndex) return;

        if (event.type === 'ready' || event.type === 'solo') {
          // handleReady(event);
        }

        if (event.type === 'stop') {

        }

        $timeout(function () {
          scope.$apply(function () {
            if (event.type === 'noteon') {
              vm.keys[event.pitch.value].track = event.trackIndex + 1;
            }
            if (event.type === 'noteoff') {
              vm.keys[event.pitch.value].track = 0;
            }
          });
        });
      }
    }
  }]);



  function controller($scope, $timeout) {
    var vm = this;


  }

}
