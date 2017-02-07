/* global $ */
/* global angular */
/*jshint camelcase: false */
/*jshint unused: false */
'use strict';

/**
 * @ngdoc overview
 * @name bitbloqApp
 * @description
 * # bitbloqApp
 *
 * Main module of the application.
 */
angular
    .module('bitbloqApp', [
        'ngAria',
        'ngCookies',
        'ngRoute',
        'ngResource',
        'ngSanitize',
        'config',
        'pascalprecht.translate',
        'ngStorage',
        'duScroll',
        'ngWebSocket',
        'angular-google-analytics',
        'satellizer',
        'ngDialog',
        'angularMoment',
        'ngTagsInput',
        'puElasticInput',
        'youtube-embed',
        'ui.ace',
        'textAngular',
        'angular-clipboard',
        'angularUtils.directives.dirPagination',
        'nvd3',
        'datePicker'
    ])
    .config(['$provide', '$routeProvider', '$httpProvider', '$translateProvider', '$authProvider', '$logProvider', 'envData',
        function($provide, $routeProvider, $httpProvider, $translateProvider, $authProvider, $logProvider, envData) {

            if (envData.config.env === 'production') {
                $logProvider.debugEnabled(false);
            }

            $routeProvider
                .when('/', {
                    templateUrl: 'views/landing/landing.html',
                    controller: 'LandingCtrl'
                })
                .when('/account', {
                    templateUrl: 'views/account.html',
                    controller: 'AccountCtrl'
                })
                .when('/bloqsproject/:id?', {
                    templateUrl: 'views/project/bloqsproject.html',
                    controller: 'BloqsprojectCtrl',
                    reloadOnSearch: false
                })

                .when('/codeproject/:id?', {
                    templateUrl: 'views/code.html',
                    controller: 'CodeCtrl',
                    reloadOnSearch: false
                })
                .when('/explore:params?', {
                    templateUrl: 'views/explore.html',
                    controller: 'ExploreCtrl',
                    reloadOnSearch: false
                })
                .when('/login:params?', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl',
                    islogin: true
                })
                .when('/register', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl',
                    islogin: false
                })
                .when('/resetpassword', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl',
                    islogin: false
                })
                .when('/offline', {
                    templateUrl: 'views/landing/landing-offline.html',
                    controller: 'LandingCtrl'
                })
                .when('/projects', {
                    templateUrl: 'views/projects.html',
                    controller: 'ProjectsCtrl'
                })
                .when('/styleguide', {
                    templateUrl: 'views/styleguide.html',
                    controller: 'StylesCtrl'
                })
                .when('/cookies', {
                    templateUrl: 'views/cookies.html',
                    controller: 'CookiesCtrl'
                })
                .when('/terms', {
                    templateUrl: 'views/terms.html',
                    controller: 'TermsCtrl'
                })
                .when('/account', {
                    templateUrl: 'views/account.html',
                    controller: 'AccountCtrl',
                    authenticate: true
                })
                .when('/project/:id', {
                    templateUrl: 'views/project.html',
                    controller: 'ProjectCtrl'
                })
                .when('/learn', {
                    templateUrl: 'views/learn.html',
                    controller: 'LearnCtrl'
                })
                .when('/forum/:forumsection?/:forumresource?', {
                    templateUrl: 'views/forum/forum.html',
                    controller: 'ForumCtrl as forum',
                    reloadOnSearch: false
                })
                .when('/help/forum/:forumsection?/:forumresource?', {
                    redirectTo: '/forum/:forumsection?/:forumresource?'
                })
                .when('/maintenance', {
                    templateUrl: 'maintenance.html'
                })
                .when('/recovery/:token', {
                    templateUrl: 'views/resetPassword.html',
                    controller: 'ResetPasswordCtrl'
                })
                .when('/unsupported/:id', {
                    templateUrl: 'views/unsupported.html',
                    controller: 'UnsupportedCtrl'
                })
                // .when('/user/:id?', {
                //     templateUrl: 'views/user.html',
                //     controller: 'UserCtrl'
                // })
                .when('/features', {
                    templateUrl: 'views/landing/landing-features.html',
                    controller: 'LandingCtrl'
                })
                .when('/downloads', {
                    templateUrl: 'views/landing/landing-downloads.html',
                    controller: 'LandingCtrl'
                })
                .when('/aboutus', {
                    templateUrl: 'views/landing/landing-aboutus.html',
                    controller: 'LandingCtrl'
                })
                .when('/howitworks', {
                    templateUrl: 'views/landing/landing-howitworks.html',
                    controller: 'LandingCtrl'
                })
                .when('/bitbloq-help/', {
                    templateUrl: 'views/landing/landing-help.html',
                    controller: 'LandingCtrl'
                })
                .when('/under14authorization/:token', {
                    templateUrl: 'views/under14authorization.html',
                    controller: 'Under14AuthorizationCtrl'
                })
                .when('/center-mode/:type?/:id?/:subtype?/:subId?', {
                    templateUrl: 'views/centerMode/centerModeIndex.html',
                    controller: 'CenterCtrl',
                    reloadOnSearch: false
                })
                .when('/exercise/:id?', {
                    templateUrl: 'views/project/exercise.html',
                    controller: 'ExerciseCtrl',
                    reloadOnSearch: false
                })
                .when('/task/:id?', {
                    templateUrl: 'views/project/exercise.html',
                    controller: 'ExerciseCtrl',
                    reloadOnSearch: false
                })
                .when('/404', {
                    templateUrl: '404.html'
                })
                .otherwise({
                    redirectTo: '/404'
                });

            $authProvider.loginRedirect = null;

            // Google
            $authProvider.google({
                clientId: envData.google.clientId,
                apiKey: envData.google.apikey,
                scope: envData.google.scope,
                apis: envData.google.apis,
                responseType: 'token',
                visibleActions: envData.google.visibleActions,
                display: 'popup',
                popupOptions: {
                    width: 580,
                    height: 400
                }
            });

            // Facebook
            $authProvider.facebook({
                clientId: envData.facebook.clientId,
                authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
                scope: envData.facebook.scope,
                responseType: 'token',
                display: 'popup',
                popupOptions: {
                    width: envData.facebook.popupOptions.width,
                    height: envData.facebook.popupOptions.height
                }
            });

            // $httpProvider.interceptors.push('httpInterceptor');
            $httpProvider.interceptors.push('authInterceptor');
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            $translateProvider.useStaticFilesLoader({
                prefix: 'res/locales/',
                suffix: '.json'
            });

            //indicamos el idioma inicial
            $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
            $translateProvider.preferredLanguage(envData.config.defaultLang);
            $translateProvider.fallbackLanguage('en-GB');
        }
    ])
    .config(function(AnalyticsProvider, envData) {
        // initial configuration
        /* For more information about provider configuration: https://github.com/revolunet/angular-google-analytics#example */
        AnalyticsProvider.setAccount(envData.config.googleAnalyticsCode);
        AnalyticsProvider.trackPages(true);
        AnalyticsProvider.trackUrlParams(false);
        AnalyticsProvider.useAnalytics(true);

        if (envData.config.env === 'local') {
            AnalyticsProvider.setDomainName('none');
        }

    })
    .config(function($provide) {
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions) {
            // $delegate is the taOptions we are decorating
            // register the tool with textAngular
            taRegisterTool('uploadImage', {
                iconclass: 'fa fa-picture-o',
                tooltiptext: '',
                action: function() {
                    $('.main-image--input').click();
                }
            });
            // add the button to the default toolbar definition
            taOptions.toolbar[1].push('uploadImage');
            return taOptions;
        }]);
    })
    .config(function($provide) {
        $provide.decorator('taTranslations', function($delegate) {
            $delegate.heading.tooltip = 'H';
            $delegate.quote.tooltip = '';
            $delegate.pre.tooltip = '';
            $delegate.p.tooltip = '';

            $delegate.bold.tooltip = '';
            $delegate.italic.tooltip = '';
            $delegate.underline.tooltip = '';
            $delegate.ol.tooltip = '';
            $delegate.ul.tooltip = '';
            $delegate.undo.tooltip = '';
            $delegate.redo.tooltip = '';
            $delegate.clear.tooltip = '';

            $delegate.insertImage.tooltip = '';
            $delegate.insertLink.tooltip = '';
            $delegate.insertVideo.tooltip = '';
            return $delegate;
        });
    })
    .filter('encode', function() {
        return window.encodeURIComponent;
    })
    .run(function(Analytics, _, jsPlumb, bloqs, bloqsUtils, bloqsLanguages) {
        // Make sure _ is invoked at runtime. This does nothing but force the "_" to
        // be loaded after bootstrap. This is done so the "_" factory has a chance to
        // "erase" the global reference to the lodash library.
        // ...

    })
    .run(function(amMoment, envData) {
        amMoment.changeLocale(envData.config.defaultLang);
    });
