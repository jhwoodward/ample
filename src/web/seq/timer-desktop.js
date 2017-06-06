module.exports = function (ngModule) {

  ngModule.service('timer', ['$q', 'NanoTimer', function ($q, NanoTimer) {

    function Timer() {
      this.timer = new NanoTimer();
    }

    Timer.prototype.start = function (callback, interval) {
      this.timer.setInterval(callback, '', interval + 'u');
    }

    Timer.prototype.stop = function () {
      this.timer.clearInterval();
    }

    return new Timer();

  }]);

}

