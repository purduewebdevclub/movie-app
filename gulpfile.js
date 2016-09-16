var gulp = require('gulp'),
    jade = require('gulp-jade'),
    del = require('del'),
    babel = require('gulp-babel'),
    watch = require('gulp-watch'),
    gulpFilter = require('gulp-filter'),
    debug = require('gulp-debug'),
    plumber = require('gulp-plumber'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    ngAnnotate = require('gulp-ng-annotate'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    argv = require('yargs').argv,
    open = require('open');
require("babel-preset-es2015");
var dir = process.env.INIT_CWD.includes("admin") ? "admin" : "guest";
var IN = "www/",
    OUT = "www-build/";
gulp.task('clean', function(cb) {
    del(OUT, cb);
});

gulp.task('prod', ['clean', 'get-assets', 'media', 'extras']);
gulp.task('get-assets', ['clean'], function() {
    return gulp.src(IN + "**/*.jade")
        .pipe(jade({
            pretty: true
        }))
        .pipe(useref())
        .pipe(gulpif("*.js", ngAnnotate()), uglify())
        .pipe(gulp.dest(OUT));
});

gulp.task('extras', ['clean'], function(){
    var location = [IN + "lib/**/*.gif", IN + "lib/**/*.swf", IN + "lib/**/*.woff*", IN + "lib/**/*.ttf"];
    return gulp.src(location)
        .pipe(rename(function(path) {
            if(argv._[0] === "prod") {
                path.dirname = "../fonts";
            }
        }))
        .pipe(plumber())
        .pipe(gulp.dest(OUT + "lib"));
});

gulp.task('jade', ['clean'], function() {
    gulp.src(IN + "**/*.jade") .pipe(watch(IN + "**/*.jade"))   
        .pipe(plumber())
        .pipe(debug({title: "Watch Fired"}))
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(OUT));
});

gulp.task('media', ['clean'], function() {
    return gulp.src(IN + "media/**/*.*")
        .pipe(plumber())
        .pipe(gulp.dest(OUT + "media/"));
});

gulp.task('js', ['clean'], function () {
    var filter = gulpFilter(['**/*.js', '!lib/**/*.js']);
    gulp.src([IN + "**/*.js"])
        .pipe(watch([IN + "**/*.js"]))
        .pipe(filter)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']    
        }))
        .pipe(debug({title: "Watch Fired"}))
        .pipe(filter.restore())
        .pipe(gulp.dest(OUT));   
});

gulp.task('css', ['clean'], function () {
    var filter = gulpFilter(["**/*.css", '!lib/**/*.css']);
    gulp.src([IN + "**/*.css"])
        .pipe(watch([IN + "**/*.css"]))
        .pipe(plumber())
        .pipe(filter)
        .pipe(debug({title: "Watch Fired"}))
        .pipe(filter.restore())
        .pipe(gulp.dest(OUT));
});


gulp.task('build', ['jade', 'css', 'js', 'media', 'extras']);

gulp.task('serve', function() {
    gulp.start('build');
    connect.server({
        root: [OUT],
        port: 8000
    })
});

gulp.task('open', ['serve'], function(){
    open("http://localhost:8000/#/userlogin");
});

gulp.task('dev', ['build','serve', 'open']);

