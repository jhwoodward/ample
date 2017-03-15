var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('NoteParser pitch', function () {

  function getNotes(states) {
    return states.reduce(function (acc, item) {
      var note = item.pitch.string;
      if (item.pitch.value) {
        acc.push(note);
      }
      return acc;
    }, []);
  }

  describe('When upper case', function () {
    it('should move up', function () {
      var test = 'CDEFGABCD-E';
      var interpeter = new Interpreter();
      var result = interpeter.interpret(test);
      var notes = getNotes(result.states);
      var expectedNotes = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6', 'D6', 'Eb6'];
      expect(expectedNotes).toEqual(notes);
    });

    describe('When previous note is lower case but the same character', function() {
      it('should move up one octave', function() {
        var test = 'cC';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5', 'C6'];
        expect(expectedNotes).toEqual(notes);
      });


    });

    describe('When previous note is lower case and flat but the same character', function() {
      it('should drop one octave', function() {
        var test = '-bB';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['Bb5', 'B6'];
        expect(expectedNotes).toEqual(notes);
      });
    });

  });

  describe('When lower case', function () {
    it('should move down if previous character is different', function () {
      var test = 'Gfedcbag';
      var interpeter = new Interpreter();
      var result = interpeter.interpret(test);
      var notes = getNotes(result.states);
      var expectedNotes = ['G5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4'];
      expect(expectedNotes).toEqual(notes);
    });

    describe('When previous character is the same and also lower case', function() {

      it('should remain the same', function () {
        var test = 'ccc';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5','C5','C5'];
        expect(expectedNotes).toEqual(notes);
      });

      describe('With accidental', function() {
        it('should move down a semitone', function () {
          var test = 'c-c';
          var interpeter = new Interpreter();
          var result = interpeter.interpret(test);
          var notes = getNotes(result.states);
          var expectedNotes = ['C5','B4'];
          expect(expectedNotes).toEqual(notes);
        });

        it('should move up a semitone', function () {
          var test = 'c+c';
          var interpeter = new Interpreter();
          var result = interpeter.interpret(test);
          var notes = getNotes(result.states);
          var expectedNotes = ['C5','Db5'];
          expect(expectedNotes).toEqual(notes);
        });

      });
      


    });


    describe('When previous note is upper case but the same character', function() {
      it('should drop one octave', function() {
        var test = 'Cc';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5', 'C4'];
        expect(expectedNotes).toEqual(notes);
      });
    });

    describe('When previous note is upper case and flat but the same character', function() {
      it('should drop one octave', function() {
        var test = '-Bb';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['Bb5', 'B4'];
        expect(expectedNotes).toEqual(notes);
      });
    });
  });

  describe('With octave jump', function () {
    describe('When upper case', function () {
      it('each ! should move pitch up an octave', function () {
        var test = 'CDE!FGABCD!!-E';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5', 'D5', 'E5', 'F6', 'G6', 'A6', 'B6', 'C7', 'D7', 'Eb9'];
        expect(expectedNotes).toEqual(notes);
      });
    });

    describe('When lower case', function () {
      it('each ! should move pitch down an octave', function () {
        var test = 'Gf!edc!!ba!g';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['G5', 'F5', 'E4', 'D4', 'C4', 'B1', 'A1', 'G0'];
        expect(expectedNotes).toEqual(notes);
      });
    });

    describe('When previous note is upper case but the same character', function() {
      it('should drop three octaves when prefixed by !!', function() {
        var test = 'C!!c';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5', 'C2'];
        expect(expectedNotes).toEqual(notes);
      });
    });

    describe('When previous note is lower case but the same character', function() {
       it('should move up three octaves when prefixed by !!', function() {
        var test = 'c!!C';
        var interpeter = new Interpreter();
        var result = interpeter.interpret(test);
        var notes = getNotes(result.states);
        var expectedNotes = ['C5', 'C8'];
        expect(expectedNotes).toEqual(notes);
      });
    });
  });

});
