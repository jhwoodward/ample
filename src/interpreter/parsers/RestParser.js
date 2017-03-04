
function RestParser() {
  this.type = 'rest';
  this.test = /^\^/;
}
RestParser.prototype = {
  parse: function (s) {
    return {rest: true};
  },
  process: function (state) {
    
  }
}

module.exports = RestParser;