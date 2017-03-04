
function RelativeNoteParser() {
  this.type = 'relativeNote';
  this.test = /^[>'~_]?\!?\+*\-*[x-zX-Z]/;
}
RelativeNoteParser.prototype = {
  parse: function (s) {
    var out = Object.assign(parseArtic(s), parsePitch(s));
    return strip(out);
  },
  process: function (state) {
    
  }
}

module.exports = RelativeNoteParser;