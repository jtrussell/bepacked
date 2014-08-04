
var gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , mocha = require('gulp-mocha');

gulp.task('lint-src', function() {
  return gulp.src('lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
  return gulp.src('test/*-test.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function() {
  return gulp.src('test/*-test.js', {read: false})
    .pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch('lib/*.js', ['lint-src', 'test']);
  gulp.watch('test/*-test.js', ['lint-test', 'test']);
});

gulp.task('default', [
  'lint-src',
  'lint-test',
  'test'
]);
