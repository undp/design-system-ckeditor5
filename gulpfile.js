const yargs = require('yargs');
const gulp = require('gulp');
const rimraf = require('rimraf');
const autoprefixer = require('autoprefixer');

const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const url = require("postcss-url");
const cleanCSS = require('gulp-clean-css');
const gulpif = require('gulp-if');

// file locations
const PATH_DIST = 'dist';
const PATH_PUBLISH = 'docs';
const PATH_ASSETS = ['src/**/*', '!src/{img,js,scss}/**/*'];
const PATH_SASS = ['node_modules/@undp/design-system/stories'];
const CDN = 'https://undp.github.io/design-system/';

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Build the "docs" folder by running all of the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task('default',
  gulp.series(clean, copy, sassBuild, publish)
);

// Delete the "docs" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATH_DIST, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATH_ASSETS)
    .pipe(gulp.dest(PATH_DIST));
}

// copy compiled assets to final destination
function publish() {
  return gulp.src(PATH_DIST + '/**/*')
    .pipe(gulpif(PRODUCTION, gulp.dest(PATH_PUBLISH)));
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sassBuild() {

  const postCssPlugins = [
    // Autoprefixer
    autoprefixer(),
    // externalize icon links in imported stylesheets
    url({
      filter: '**/icons/*.svg',
      url: (asset) => {
        return CDN + '/images/' + asset.url.split('/').at(-1);
      },
    }),
    // UnCSS - Uncomment to remove unused styles in production
    // PRODUCTION && uncss(UNCSS_OPTIONS),
  ].filter(Boolean);

  return gulp.src('src/scss/ckeditor5.scss')
    .pipe(sass({
      includePaths: PATH_SASS
    })
    .on('error', sass.logError))
    .pipe(postcss(postCssPlugins))
    .pipe(gulpif(PRODUCTION, cleanCSS({ level: {1: {specialComments: 0}} })))
    .pipe(gulp.dest(PATH_DIST + '/css'));
}
