var gulp = require('gulp');
var rsync = require('gulp-rsync');
var webpack = require('gulp-webpack');

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
