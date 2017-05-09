var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");


var watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['PTM/client/main.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));


function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest("PTM/webapp/static/js"));
}

gulp.task("default", bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);