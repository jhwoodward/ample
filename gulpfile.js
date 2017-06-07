var gulp = require('gulp');
var rsync = require('gulp-rsync');
var webpack = require('gulp-webpack');
var childProcess  = require('child_process');
var electron      = require('electron-prebuilt');

// create the gulp task
gulp.task('desktop',['build-desktop'], function () { 
  childProcess.spawn(electron, ['--debug=5858','./dist/main'], { stdio: 'inherit' }); 
});

gulp.task('build-web', function () {
  var config = require('./webpack.config.js');
  config.watch = false;
  return gulp.src('./src/web/app.web.js')
    .pipe(webpack(config))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build-desktop', function () {
  var config = require('./webpack.desktop.config.js');
  config.watch = false;
  return gulp.src('./src/web/app.desktop.js')
    .pipe(webpack(config))
    .pipe(gulp.dest('./dist/'));
})

gulp.task('deploy', ['build-web'], function () {
  return gulp.src('dist/**')
    .pipe(rsync({
      root: 'dist/',
      hostname: 'ec2',
      destination: 'midiscript/dist/'
    }));
});
