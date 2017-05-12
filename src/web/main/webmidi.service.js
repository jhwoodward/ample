var webmidi = require('webmidi');

module.exports = function (ngModule) {

  ngModule.service("webMidiService", ['$q', function ($q) {

    function WebMidiService() {

    }

    WebMidiService.prototype = {
      enable: function () {
        var deferred = $q.defer();
        webmidi.enable(function (err) {
          this.inputs = webmidi.inputs;
          this.outputs = webmidi.outputs
          this.selectedOutput = webmidi.outputs[0];
          deferred.resolve();
        }.bind(this));
        return deferred.promise;
      }
    };

    return new WebMidiService();

  }]);

};