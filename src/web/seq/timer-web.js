require('./WAAClock');

module.exports = function (ngModule) {

  ngModule.service('timer', [function () {

    function Timer() {
    }

    Timer.prototype.start = function (callback, interval) {

      interval = interval * 0.000001;

      this.context = new AudioContext();
      this.clock = new WAAClock(this.context);
      this.clock.start();
      this.scheduled = this.clock.callbackAtTime(callback, interval)
        .repeat(interval)
        .tolerance({ late: 500 })
    }

    Timer.prototype.stop = function () {
      if (this.clock) {
        this.clock.stop();
      }
    }

    return new Timer();

  }]);

}
