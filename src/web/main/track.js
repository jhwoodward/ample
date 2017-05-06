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
      controller: ['$scope', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope) {
    var vm = this;
    vm.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    vm.showChannelDropdown = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };

    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    //  http://codemirror.net/doc/manual.html#api_marker
    var marker;
    function handler(event) {
      if (event.type=== 'stop') {
        marker.clear();
      }
      if (event.type !== 'tick') return;
      event.events.forEach(function (e) {
        if (e.track === vm.track.key && e.origin) {
          if (marker) { marker.clear();}
          var start = editor.posFromIndex(e.origin.start);
          var end = editor.posFromIndex(e.origin.end);
          console.log(start);
          marker = editor.markText(start, end, { className: 'highlight' });
        }
      });
    }

    vm.selectChannel = function (channel) {
      console.log(channel, index);
      vm.track.channel = channel - 1;
    }
    vm.options = {
      lineWrapping: true,
      //lineNumbers: false,
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

