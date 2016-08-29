// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-03-26 using
// generator-karma 0.9.0

module.exports = function(config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            '../bower_components/jquery/dist/jquery.js',
            '../bower_components/angular/angular.js',
            '../bower_components/angular-aria/angular-aria.js',
            '../bower_components/angular-cookies/angular-cookies.js',
            '../bower_components/angular-resource/angular-resource.js',
            '../bower_components/angular-elastic-input/dist/angular-elastic-input.min.js',
            '../bower_components/moment/moment.js',
            '../bower_components/angular-moment/angular-moment.js',
            '../bower_components/angular-route/angular-route.js',
            '../bower_components/angular-sanitize/angular-sanitize.js',
            '../bower_components/angular-scroll/angular-scroll.js',
            '../bower_components/angular-translate/angular-translate.js',
            '../bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            '../bower_components/angular-ui-ace/ui-ace.js',
            '../bower_components/angular-websocket/angular-websocket.min.js',
            '../bower_components/angular-youtube-mb/src/angular-youtube-embed.js',
            '../bower_components/js-beautify/js/lib/beautify.js',
            '../bower_components/js-beautify/js/lib/beautify-css.js',
            '../bower_components/js-beautify/js/lib/beautify-html.js',
            '../bower_components/jsplumb/dist/js/jsPlumb-2.0.5.js',
            '../bower_components/jsrsasign/jsrsasign-latest-all-min.js',
            '../bower_components/lodash/lodash.js',
            '../bower_components/mobile-detect/mobile-detect.js',
            '../bower_components/ng-tags-input/ng-tags-input.min.js',
            '../bower_components/ngstorage/ngStorage.js',
            '../bower_components/penguin/lib/js/penguin.min.js',
            '../bower_components/satellizer/satellizer.js',
            '../bower_components/jszip/dist/jszip.js',
            '../bower_components/rangy/rangy-core.js',
            '../bower_components/rangy/rangy-classapplier.js',
            '../bower_components/rangy/rangy-highlighter.js',
            '../bower_components/rangy/rangy-selectionsaverestore.js',
            '../bower_components/rangy/rangy-serializer.js',
            '../bower_components/rangy/rangy-textrange.js',
            '../bower_components/textAngular/dist/textAngular.js',
            '../bower_components/textAngular/dist/textAngular-sanitize.js',
            '../bower_components/textAngular/dist/textAngularSetup.js',
            '../bower_components/angular-clipboard/angular-clipboard.js',
            '../bower_components/angularUtils-pagination/dirPagination.js',
            '../bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
            '../bower_components/jquery-ui/jquery-ui.js',
            '../bower_components/jspanel/source/jquery.jspanel.js',
            '../bower_components/fastclick/lib/fastclick.js',
            '../bower_components/ng-dialog/js/ngDialog.js',
            '../bower_components/jquery-auto-grow-input/jquery.auto-grow-input.min.js',
            '../bower_components/autogrow/autogrow.js',
            '../bower_components/bloqs/dist/bloqs.min.js',
            '../bower_components/angular-mocks/angular-mocks.js',
            // endbower
            '../app/scripts/**/*.js',
            '../test/unit/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Which plugins to enable
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO

        // Uncomment the following lines if you are using grunt's server to run the tests
        // proxies: {
        //   '/': 'http://localhost:9000/'
        // },
        // URL root prevent conflicts with the site root
        // urlRoot: '_karma_'
    });
};
