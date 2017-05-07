var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var gutil = require("gulp-util");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

gulp.task("copy-dist", function() {
  return gulp.src('PTM/webapp/app/dist/*.js')
    .pipe(gulp.dest('PTM/webapp/static/js'));
});

gulp.task("default", ['copy-dist'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['PTM/webapp/app/src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("PTM/webapp/app/dist"));
});
