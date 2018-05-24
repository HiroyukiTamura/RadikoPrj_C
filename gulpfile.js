const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const using = require('gulp-using');
const rename = require("gulp-rename");
const ejs = require("gulp-ejs");
const htmlmin = require('gulp-htmlmin');
const fs = require("fs");
const Stream = require('stream');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
// const uglify = require('gulp-uglify');
const uglify = require('gulp-uglify-es').default;
const javascriptObfuscator = require('gulp-javascript-obfuscator');
const pump = require('pump');

gulp.task('default', ['css']);

const witchDir = ['timetable', 'search', 'download', 'about', 'install'];
let filePath = '';

gulp.task('css', ()=>{
    const index = 0;
    return gulp.src(['./public/'+ witchDir[index] +'/style.scss'])
        .pipe(using())
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(getFileName(filePath))
        .pipe(sass())
        .pipe(rename(function(path) {
            // let pathArr = filePath.substr(0, filePath.length-5).split('\\');
            // path.dirname = pathArr[pathArr.length-1];
            path.dirname = witchDir[index];
            path.extname = '.css';
            path.basename = 'style';
        }))
        .pipe(gulp.dest('./public/'));
});

gulp.task("ejs", ()=>{
    const json = JSON.parse(fs.readFileSync('ejs/gulpconf.json'));
    return gulp.src(
        ["ejs/origin/*.ejs"] //参照するディレクトリ、出力を除外するファイル
    )
        .pipe(using())
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(ejs(json))
        .pipe(getFileName(filePath))
        .pipe(rename(path =>{
            console.log(filePath);
            let pathArr = filePath.substr(0, filePath.length-4).split('\\');
            let lastDir = pathArr[pathArr.length-1];
            console.log(lastDir);
            path.dirname = lastDir;
            path.extname = '.html';
            path.basename = 'index';
        }))
        .pipe(gulp.dest("./public/"));
});

gulp.task('css:minify', ()=>{
    return gulp.src([
        './public/**/**.css',
        '!./public/**/**.min.css'
    ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream());
});

gulp.task('js:uglify', cb =>{
    const arr = [
        gulp.src(['./public/**/**.js', '!./public/**/uglified.js']),
        uglify(),
        javascriptObfuscator({
            compact: true,
            sourceMap: true,
            debugProtection: true,
            debugProtectionInterval: true,
            disableConsoleOutput: true
        }),
        rename({basename: 'uglified'}),
        gulp.dest('./public/')
    ];
    pump(arr, cb);
});

gulp.task('html:minify', ()=>{
    return gulp.src(['./public/**/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream());
});

function getFileName(){
    let stream = new Stream.Transform({ objectMode: true });
    stream._transform = function(file, unused, callback) {
        filePath = file.path;
        callback(null, file);
    };
    return stream;
}