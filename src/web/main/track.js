var eventType = require('../../interpreter/constants').eventType;

module.exports = function (ngModule) {

  ngModule.directive('track', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./track.html'),
      scope: {
        sequencer: '=',
        trackIndex: '=',
        track: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout) {
    var vm = this;
    vm.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    vm.showChannelDropdown = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };
    vm.toggleMute = function () {
      vm.sequencer.toggleMute(vm.track);
      if (vm.track.isMuted) {
        if (marker) {
          marker.clear();
        }
        if (subMarker) {
          subMarker.clear();
        }
        if (sustainMarker) {
          sustainMarker.clear();
        }
        vm.setActive(false);
      }
    }

    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    //  http://codemirror.net/doc/manual.html#api_marker
    var marker;
    var subMarker;
    var sustainMarker;
    function handler(event) {
      if (event.type === 'stop') {
        if (marker) { marker.clear(); }
        if (subMarker) { subMarker.clear(); }
        if (sustainMarker) { sustainMarker.clear(); }
        vm.setActive(false);
      } else if (event.type === 'pause') {
      } else if (event.type === 'tick') {
        event.events.forEach(function (e) {
          if (e.track === vm.track.key && e.origin) {
            var start = editor.posFromIndex(e.origin.start);
            var end = editor.posFromIndex(e.origin.end);
            if (e.type === eventType.substitution) {
              if (subMarker) { subMarker.clear(); }
              subMarker = editor.markText(start, end, { className: 'sub-highlight' });
            } else if (e.type === eventType.substitutionEnd) {
              if (subMarker) { subMarker.clear(); }
            } else if (e.type === eventType.sustain) {
              if (sustainMarker) { sustainMarker.clear(); }
              sustainMarker = editor.markText(start, end, { className: 'sustain-highlight' });
            } else {
              if (marker) { marker.clear(); }
              if (sustainMarker) { sustainMarker.clear(); }
              if (e.type === eventType.noteon) {
                vm.setActive(true);
              }
              if (e.type === eventType.noteoff) {
                vm.setActive(false);
              }

              marker = editor.markText(start, end, { className: 'highlight' });
            }

          }
        });
      }
    }

    vm.setActive = function (active) {
      $timeout(function () {
        $scope.$apply(function () {
          vm.active = active;
        });
      });
    }

    vm.selectChannel = function (channel) {
      vm.track.channel = channel - 1;
    }
    vm.options = {
      lineWrapping: true,
      lineNumbers: true,
      height: '100%',
      mode: {
        name: 'javascript',
        statementIndent: 2,
        json: true,
        viewportMargin: Infinity,

      },
      theme: 'blackboard'
    };

    var editor;
    vm.codemirrorLoaded = function (ed) {
      editor = ed;
      var charWidth = editor.defaultCharWidth(), basePadding = 4;
      editor.on("renderLine", function (cm, line, elt) {
        var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
        elt.style.textIndent = "-" + off + "px";
        elt.style.paddingLeft = (basePadding + off) + "px";
      });
      editor.refresh();
      editor.focus();



    };
  }

}

