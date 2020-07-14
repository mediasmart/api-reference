var gulp = require('gulp');
var util = require('gulp-util')
var gulpConnect = require('gulp-connect');
var express = require('express');
var cors = require('cors');
var exec = require('child_process').exec;
var portfinder = require('portfinder');
var swaggerRepo = require('swagger-repo');

var DIST_DIR = 'web_deploy';

function build (cb) {
  exec('npm run build', function (err, stdout, stderr) {
    console.log(stderr);
    cb(err);
  });
}

function edit () {
  portfinder.getPort({port: 5000}, function (err, port) {
    var app = express();
    app.use('/', swaggerRepo.swaggerEditorMiddleware());
    app.listen(port);
    util.log(util.colors.green('swagger-editor started http://localhost:' + port));
  });
}

var reload = gulp.series(build, function () {
  gulp.src(DIST_DIR).pipe(gulpConnect.reload())
});

function watch () {
  gulp.watch(['spec/**/*', 'web/**/*'], gulp.series(reload));
}

var serve = gulp.series(build, gulp.parallel(watch, edit, function () {
  portfinder.getPort({port: 3000}, function (err, port) {
    gulpConnect.server({
      root: [DIST_DIR],
      livereload: true,
      port: port,
      middleware: function (gulpConnect, opt) {
        return [
          cors()
        ]
      }
    });
  });
}));

exports.build = build;
exports.edit = edit;
exports.watch = watch;
exports.serve = serve;
exports.reload = reload;

exports.default = serve;