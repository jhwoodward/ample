var webmidi = require('webmidi');

module.exports = function (ngModule) {

  ngModule.service('midiService', ['$q',  function ($q) {

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
/*
    if (easymidi) {
      
       return { 
         selectedOutput: new easymidi.Output('IAC Driver Bus 1') 
        };
    } else {
      */
      return new WebMidiService();
   // }
 

   

  }]);

};