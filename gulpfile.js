// generated on 2019-05-30 using generator-webapp 4.0.0-5
const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Modernizr = require('modernizr');
const browserSync = require('browser-sync');
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { argv } = require('yargs');
const sassLint = require('gulp-sass-lint');
const a11y = require('gulp-accessibility');
const w3cjs = require('gulp-w3cjs');
// const smoosher = require('gulp-smoosher');

const $ = gulpLoadPlugins();
const server = browserSync.create();

const port = argv.port || 9000;

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isDev = !isProd && !isTest;

function styles() {
  return src('app/css/*.scss')
    .pipe(sassLint({
      configFile: '.sass-lint.yml'
    }))
    .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe($.if(!isProd, $.sourcemaps.write()))
    .pipe(dest('.tmp/css'))
    .pipe(server.reload({stream: true}));
};

function scripts() {
  return src('app/js/**/*.js')
    .pipe($.plumber())
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(!isProd, $.sourcemaps.write('.')))
    .pipe(dest('.tmp/js'))
    .pipe(server.reload({stream: true}));
};

async function modernizr() {
  const readConfig = () => new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/modernizr.json`, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    })
  })
  const createDir = () => new Promise((resolve, reject) => {
    mkdirp(`${__dirname}/.tmp/js`, err => {
      if (err) reject(err);
      resolve();
    })
  });
  const generateScript = config => new Promise((resolve, reject) => {
    Modernizr.build(config, content => {
      fs.writeFile(`${__dirname}/.tmp/js/modernizr.js`, content, err => {
        if (err) reject(err);
        resolve(content);
      });
    })
  });

  const [config] = await Promise.all([
    readConfig(),
    createDir()
  ]);
  await generateScript(config);
}

const lintBase = files => {
  return src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(server.reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!server.active, $.eslint.failAfterError()));
}
function lint() {
  return lintBase('app/js/**/*.js')
    .pipe(dest('app/js'));
};
function lintTest() {
  return lintBase('test/spec/**/*.js')
    .pipe(dest('test/spec'));
};

function html() {
  return src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.postcss([cssnano({safe: true, autoprefixer: false})])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: false,
      // minifyCSS: true,
      // minifyJS: {compress: {drop_console: true}},
      // processConditionalComments: false,
      // removeComments: false,
      // removeEmptyAttributes: true,
      // removeScriptTypeAttributes: true,
      // removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('dist'));
}

function images() {
  return src('app/img/**/*', { since: lastRun(images) })
    .pipe($.imagemin())
    .pipe(dest('dist/img'));
};

function fonts() {
  return src('app/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.if(!isProd, dest('.tmp/fonts'), dest('dist/fonts')));
};

// WCAG accessibility check
function a11yCheck() {
	return src('app/*.html')
    .pipe(a11y({
      force: true,
      accessibilityLevel: 'WCAG2AAA',
      reportLevels: {
        notice: false,
        warning: false,
        error: true
      },
      ignore: [
        'WCAG2AAA.Principle3.Guideline3_2.3_2_2.H32.2' // TODO
      ]
    }))
};

// W3C validation
function w3cValidation() {
	return src('app/*.html')
    .pipe(w3cjs().on('error', function(e) {
      console.log(e);
    }))
};

function extras() {
  return src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(dest('dist'));
};

// inline above-the-fold css via smoosher
// function inline() {
// 	return src('dist/*.html')
//     .pipe(smoosher({
//       base: 'dist'
//     }))
//     .pipe(dest('dist'));
// };

function clean() {
  return del(['.tmp', 'dist'])
}

function measureSize() {
  return src('dist/**/*')
    .pipe($.size({title: 'build', gzip: true}));
}

const build = series(
  clean,
  parallel(
    lint,
    series(parallel(styles, scripts, modernizr), html),
    images,
    fonts,
    a11yCheck,
    w3cValidation,
    extras
  ),
  // inline,
  measureSize
);

function startAppServer() {
  server.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  watch([
    'app/*.html',
    'app/img/**/*',
    '.tmp/fonts/**/*',
  ]).on('change', server.reload);

  watch('app/css/**/*.scss', styles);
  watch('app/js/**/*.js', scripts);
  watch('modernizr.json', modernizr);
  watch('app/fonts/**/*', fonts);
}

function startTestServer() {
  server.init({
    notify: false,
    port,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/js': '.tmp/js',
        '/node_modules': 'node_modules'
      }
    }
  });

  watch('app/js/**/*.js', scripts);
  watch(['test/spec/**/*.js', 'test/index.html']).on('change', server.reload);
  watch('test/spec/**/*.js', lintTest);
}

function startDistServer() {
  server.init({
    notify: false,
    port,
    server: {
      baseDir: 'dist',
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
}

let serve;
if (isDev) {
  serve = series(clean, parallel(styles, scripts, modernizr, fonts), startAppServer);
} else if (isTest) {
  serve = series(clean, scripts, startTestServer);
} else if (isProd) {
  serve = series(build, startDistServer);
}

exports.serve = serve;
exports.build = build;
exports.default = build;
