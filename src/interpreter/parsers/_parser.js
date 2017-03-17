module.exports = {
  match: function match(s) {
    var result = this.test.exec(s);
    if (result) {
      this.string = result[0];
      this.parsed = this.parse(this.string);
    }
    return !!result && !!this.parsed;
  }
};
