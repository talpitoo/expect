import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import scssLint from 'gulp-scss-lint';
import modernizr from 'gulp-modernizr';
import smoosher from 'gulp-smoosher';
// import critical from 'critical';
import {
  stream as wiredep
}
from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('app/css/*.scss')
    .pipe(scssLint({
      config: '.scss-lint.yml'
    }))
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('scripts', () => {
  return gulp.src('app/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({
      stream: true
    }));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({
        stream: true,
        once: true
      }))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      //.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/js/**/*.js'));

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({
      searchPath: ['.tmp', 'app', '.']
    }))
    //.pipe($.if('*.js', $.uglify({mangle: false}))) // if uglify messes up
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: false
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/img/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{
          cleanupIDs: false
        }]
      }))
      .on('error', function(err) {
        console.log(err);
        this.end();
      })))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(err) {})
      .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    open: false, // todo for NTFS partition
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    '.tmp/js/**/*.js',
    'app/img/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/css/**/*.scss', ['styles']);
  gulp.watch('app/js/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/css/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/css'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

// custom modernizr build
gulp.task('modernizr', () => {
  gulp.src('app/js/**/*.js')
    .pipe(modernizr({
      "crawl": false,
      "customTests": [],
      "tests": [
        "csstransforms3d"
        // "flexbox",
        // "inlinesvg",
        // "touchevents"
      ],
      "options": [
        "setClasses"
      ]
    }))
    //.pipe($.uglify())
    .pipe(gulp.dest('.tmp/js'))
});

// inline critical/above the fold css
// gulp.task('critical', () => {
//   critical.generate({
//     inline: false,
//     base: 'dist/',
//     src: 'index.html',
//     dest: 'dist/css/main.css',
//     minify: false,
//     dimensions: [{
//         width: 320,
//         height: 480
//     }, {
//         width: 767,
//         height: 767
//     }, {
//         width: 991,
//         height: 991
//     }, {
//         width: 1920,
//         height: 1080
//     }],
//     ignore: ['@-ms-viewport', '@font-face']
//     });
// });

gulp.task('inline', ['build'], () => {
  return gulp.src('dist/*.html')
      .pipe(smoosher({
        base: 'dist'
      }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['lint', 'modernizr', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*')
  .pipe($.size({
    title: 'build',
    gzip: true
  }));
});

// for some reason the 'inline' task requires a separate run, that's why it has a dependency on 'build'
gulp.task('default', ['clean'], () => {
  gulp.start('inline');
});
