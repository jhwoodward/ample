var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var Sequencer = require('.././Sequencer.js');
var jingle = require('../../../songs/jingle');
var InfoLogger = require('../InfoLogger');
var PianoRollLogger = require('../PianoRollLogger');
var beautify_js = require('js-beautify').js_beautify

module.exports = function (ngModule) {
  ngModule.controller('demoController', ['$scope', '$timeout', controller]);

}

function controller($scope, $timeout) {
  var vm = this;
  vm.brand = 'Nompl';
  vm.song = songToString(jingle);
  vm.tracks = songToArray(jingle);
  vm.options = {
    lineWrapping: true,
    lineNumbers: false,
    height: '100%',
    mode: {
      name: 'javascript',
      statementIndent: 5,
      json: true,
      viewportMargin: Infinity,
      theme: 'blackboard'
    }
  };


  var autoScroll;
  var logElement;
  $timeout(function () {
    logElement = document.getElementById('log');
  });

  function songToArray(song) {
    var out = [];
    for (var key in song) {
      out.push({
        key,
        part: song[key].part,
        sub: song[key].sub,
        channel: song[key].channel
      });
    }
    return out;

  }

  function songFromArray(tracks) {
    var out = {};
    tracks.forEach(t => {
      out[t.key] = {
        channel: t.channel,
        sub: t.sub,
        part: t.part,
      }
    });
    return out;
  }

  function songToString(song) {
    return beautify_js(JSON.stringify(song).replace(/\\n/g, '').replace(/\\t/g, ''), { indent_size: 2 });
  }

  function scrollToBottom() {
    logElement.scrollTop = logElement.scrollHeight
  }

  vm.codemirrorLoaded = function (editor) {

    var charWidth = editor.defaultCharWidth(), basePadding = 4;
    editor.on("renderLine", function (cm, line, elt) {
      var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
      elt.style.textIndent = "-" + off + "px";
      elt.style.paddingLeft = (basePadding + off) + "px";
    });
    editor.refresh();
    editor.focus();
  };

  //var logger = new InfoLogger(onLogInfo);
  var logger = new PianoRollLogger(onLogPianoRoll);

  var seq = new Sequencer(logger);
  seq.init(function (output) {
    console.log('output', output);
  });

  function startScrollLogWindow() {
    window.clearInterval(autoScroll);
    autoScroll = window.setInterval(scrollToBottom, 100);
  }
  function stopScrollLogWindow() {
    window.clearInterval(autoScroll);
  }

  vm.play = function () {
    vm.logs = [];
    vm.pianoRoll = [];
    //var song = JSON.parse(vm.song);
    var song = songFromArray(vm.tracks);
    startScrollLogWindow();
    seq.load(song).start();
    vm.playing = true;
  }

  vm.playing = false;

  vm.togglePause = function () {
    if (seq.paused) {
      startScrollLogWindow();
      vm.playing = true;
    } else {
      stopScrollLogWindow();
      vm.playing = false;
    }
    seq.togglePause();
  }

  vm.stop = function () {
    $timeout(function () {
      $scope.$apply(function () {
        stopScrollLogWindow();
        seq.stop();
        vm.playing = false;
      });
    });

  }


  function handleEvent(e) {
    if (e.type === 'end') {
      vm.stop();
    }
  }

  vm.logs = [];
  vm.pianoRoll = [];
  function onLogInfo(e) {
    handleEvent(e);
    $timeout(function () {
      $scope.$apply(function () {
        vm.logs.push(e.data);
      });
    })
  }

  function onLogPianoRoll(e) {
    handleEvent(e);
    if (e.type !== 'pitch') return;
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
        vm.pianoRoll.push(e);

      });
    })
  }

}


