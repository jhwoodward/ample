var gulp = require('gulp');
var rsync = require('gulp-rsync');
var webpack = require('gulp-webpack');
var childProcess  = require('child_process');
var electron      = require('electron-prebuilt');

// create the gulp task
gulp.task('run', function () { 
  childProcess.spawn(electron, ['--debug=5858','./dist/main'], { stdio: 'inherit' }); 
});

gulp.task('build', function () {
  var config = require('./webpack.config.js');
  config.watch = false;
  return gulp.src('./src/web/app.js')
    .pipe(webpack(config))
    .pipe(gulp.dest('./dist/'));
})
gulp.task('deploy', ['build'], function () {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'ec2',
      destination: 'midiscript/dist/'
    }));
});
