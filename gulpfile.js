var gulp            = require('gulp'),
    runSequence     = require('gulp-run-sequence'),
    sass            = require('gulp-sass'),
    watch           = require('gulp-watch'),
    rename          = require('gulp-rename'),
    sourcemaps      = require('gulp-sourcemaps'),
    cleanCSS        = require('gulp-clean-css'),
    del             = require('del'),
    spritesmith     = require('gulp.spritesmith-multi'),
    merge           = require('merge-stream'),
    postcss         = require('gulp-postcss');


// clean
gulp.task('clean', function() {    
    return del(['./img/sprite/*','./scss/sprite/*']);
});

// image sprite
gulp.task('sprite', function() {
    var opts = {
        spritesmith: function (options, sprite, icons){
            options.imgPath =  `../img/sprite/${options.imgName}`;
            options.retinaImgPath =  `../img/sprite/${options.retinaImgName}`;
            options.cssName = `_${sprite}-sprite.scss`;
            options.cssTemplate = null;
            //options.algorithm = 'top-down';
            options.padding = 0;
            options.cssSpritesheetName = `${sprite}-normal`; // default: $bullet-normal-sprites
            options.cssRetinaSpritesheetName = `${sprite}-retina`; // default: $bullet-retina-sprites
            options.cssRetinaGroupsName = `${sprite}-groups`; // default: $retina-groups
            
            options.cssVarMap =  function(sp) {
               sp.name = `${sprite}-${sp.name}`; 
               // ex) $icon-sprite1-name: 'sprite1' --> 'icon-sprite1'
            }; 
            return options;
        }
    };
    
    var spriteData = gulp.src('img-sprites/**/*.png') // 생성할 이미지들 경로
    .pipe(spritesmith(opts)).on('error', function (err) {
        console.log(err)
    });

    var imgStream = spriteData.img.pipe(gulp.dest('img/sprite')); //생성된 이미지와 scss 경로
    var cssStream = spriteData.css.pipe(gulp.dest('scss/sprite'));
    return merge(imgStream, cssStream);
});


// Sass컴파일, css파일 만들기
gulp.task('sass', function() {
    return gulp.src('./scss/test.scss') // SCSS 파일을 읽어온다        
        //.pipe(sourcemaps.init()) // 소스맵 초기화(소스맵을 생성)
        .pipe(sass({ outputStyle : "compressed" }).on('error', sass.logError)) //nested, expanded, compact, compressed
        //.pipe(sourcemaps.write('./')) // 위에서 생성한 소스맵을 사용한다
        .pipe(gulp.dest('./scss/')); // css경로 설정
});

// 컴파일된 css파일에 postcss플러그인들 적용하기
gulp.task('styles', function() {
    return gulp.src('./scss/test.css') // 컴파일된 css파일을 읽어온다
        .pipe(postcss([
            require('autoprefixer')({ browsers: ['last 2 versions', 'ie 6-8', 'Firefox > 20'] })
        ]))
        //.pipe(cleanCSS()) // css소스코드를 압축한다
        //.pipe(rename({ suffix: '.min' })) // 수정완료된 파일명에 .min 붙이기
        .pipe(gulp.dest('./scss/')); // 수정된 css파일이 저장될 폴더 지정
});

// 하나씩 순서대로 실행되어야 한다
gulp.task('sprite-sass', function() {
    runSequence('clean', 'sprite', 'sass');
});

gulp.task('sass-styles', function() {
    runSequence('sass','styles');
});

// 해당위치에 파일이 추가-삭제-변경되면 실행한다
gulp.task('watch', function() {
    watch(['./img-sprites/**/*.png'], function() {
        gulp.start('sprite-sass');
    });
    watch(['./scss/*.scss'], function() {
        gulp.start('sass-styles');
    });
});


// 'default' task
// gulp 혹은 gulp default 입력
gulp.task('default', function() {
    gulp.start('sprite-sass', 'styles', 'watch');
});