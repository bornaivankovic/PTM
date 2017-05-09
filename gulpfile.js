var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var browserSync = require('browser-sync').create();

var build = function (cfg) {
    return browserify({
            basedir: '.',
            debug: cfg.debug,
            entries: ['PTM/client/main.ts'],
            cache: {},
            packageCache: {}
        })
        .plugin(tsify)
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest("PTM/webapp/static/js/"))
        .pipe(browserSync.init({
            server: {
                baseDir: "./"
            }
        }));
}


gulp.task("debug", function () {
    return build({
        debug: true
    })
});


gulp.task("build", function () {
    return build({
        debug: false
    })
});

gulp.task("watch", function () {
    gulp.watch(['PTM/client/**/*.ts'], ['debug']);
    gulp.watch(['PTM/webapp/static/js/app.js']).on('change', browserSync.reload);

});

gulp.task("default", ["debug"], function () {
    gulp.start('watch');
});