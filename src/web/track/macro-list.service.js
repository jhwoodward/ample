var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.service('macroListService', ['storeFactory', function (storeFactory) {

    function getPayload(macroList) {
      var payload = {
        part:'',
        macros: []
      };
      for (var key in macroList) {
        if (key !== 'macros' && key !== 'part' && macroList.hasOwnProperty(key)) {
          payload[key] = macroList[key];
        }
      }
      payload.macros = macroList.macros.map(m => {
        return {
          key: m.key,
          type: m.type,
          value: m.value
        };
      });
      return payload;
    }

    function getNew() {
      return {
        name: '',
        part: '',
        description: '',
        macros: []
      };
    }

    function onLoad() {
      this.part = this.part || '';
      return this;
    }

    

    var props = {
      requireKey: true
    };

    return storeFactory.create('macroList', getNew, getPayload, props, onLoad);

  }]);

};
