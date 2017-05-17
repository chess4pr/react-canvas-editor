var browserify = require('browserify');
var gulp = require('gulp');
var connect = require('gulp-connect');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify');
var coffee = require('gulp-coffee');
var babel = require('gulp-babel');
var preprocess = require('gulp-preprocess');
var preprocessify = require('preprocessify');
var merge = require('merge-stream');

gulp.task('commonjs', function () {
   var babelTrans = gulp.src(['./src/**/*.js', './src/**/*.jsx'])
        .pipe(preprocess({context: {INCLUDE_GUI: true}}))
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest('./wards/lib/'));
    var coffeeTrans = gulp.src('./src/**/*.coffee')
        .pipe(preprocess({context: {INCLUDE_GUI: true}}))
        .pipe(coffee({bare: true}))
        .pipe(gulp.dest('./wards/lib/js/'));

    return merge(babelTrans, coffeeTrans);
});

gulp.task('serve', function () {
    connect.server({
        livereload: {port: 35728}
    });
});

gulp.task('watch', function () {
    gulp.watch('./src/js/*.js', ['commonjs']);
    gulp.watch('./src/js/*.js', ['wards']);
    gulp.watch('./index.html', ['index']);
});

gulp.task('wards', function () {
    return gulp.src('./src/js/*.js')
        .pipe(connect.reload())
});

gulp.task('index', function () {
    return gulp.src('./index.html')
        .pipe(connect.reload())
});

gulp.task('dev', ['watch','serve'], function () {
});
