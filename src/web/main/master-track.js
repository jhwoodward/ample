var eventType = require('../../interpreter/constants').eventType;

module.exports = function (ngModule) {

  ngModule.directive('masterTrack', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./master-track.html'),
      scope: {
        sequencer: '=',
        master: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout) {
    var vm = this;


    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    function handler(event) {

    }


    vm.options = {
      lineWrapping: true,
      lineNumbers: false,
      height: '100%',
      mode: {
        name: 'javascript',
        statementIndent: 2,
        json: true,
        viewportMargin: Infinity
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

    $scope.$watch('vm.master.part', function (val, old) {
      if (val && old && val !== old) {
        vm.sequencer.updateMaster(vm.master);
      }
    });

  }

}

