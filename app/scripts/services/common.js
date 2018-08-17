/* global MobileDetect */
'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.common
 * @description
 * # common
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('common', function($filter, $log, envData, packageData, userApi, User, centerModeApi, $location, $rootScope, $q, _, $sessionStorage, $translate, ngDialog, $http, amMoment, $window, $cookieStore, alertsService, utils, userRobotsApi, hardwareApi) {

        var exports = {},
            navigatorLang = $window.navigator.language || $window.navigator.userLanguage;

        $log.log('Bitbloq version:', packageData.version);

        //See drag directives
        exports.supportSteps = [];
        exports.appAlert = null;
        exports.avatarChange = false;
        exports.draggingElement = {};
        exports.connectedWeb2Board = false;
        exports.userHardware = {};
        exports.isLoading = false;
        exports.isLoggedIn = userApi.isLoggedIn;
        exports.isAdmin = userApi.isAdmin;
        exports.lastUrl = '';
        exports.oldVersionMasthead = false;
        exports.os = utils.getOs();
        exports.properties = null;
        exports.removeProjects = [];
        exports.section = '';
        exports.session = {
            bloqTab: false,
            project: {},
            save: false
        };
        exports.translate = $filter('translate');

        exports.urlImage = envData.config.gCloudUrl + '/images/';
        exports.user = null;
        exports.userRole = 'student';
        exports.warnedOfIncompatibility = false;

        exports.langToBQ = {
            ca: 'es',
            de: 'de',
            en: 'uk',
            es: 'es',
            eu: 'es',
            fr: 'fr',
            gl: 'es',
            it: 'it',
            nl: 'uk',
            pt: 'pt',
            ru: 'ru',
            zh: 'uk'
        };

        var langToAngularLng = {
            ca: 'ca-ES',
            de: 'de-De',
            en: 'en-GB',
            es: 'es-ES',
            eu: 'eu-ES',
            fr: 'fr-FR',
            gl: 'gl',
            it: 'it-IT',
            nl: 'en-GB',
            pt: 'pt-PT',
            ru: 'en-GB',
            zh: 'en-GB'
        };
        var loadedUserPromise = $q.defer(),
            loadedRolePromise = $q.defer(),
            loadedPropertyPromise = $q.defer();

        exports.setUser = function(user) {
            if (loadedUserPromise.promise.$$state.status !== 0) {
                loadedUserPromise = $q.defer();
            }
            if (user !== null && typeof user === 'object') {
                var lng = user.language || sessionStorage.guestLanguage || navigatorLang || 'es-ES';
                $translate.use(lng);
                if (user.cookiePolicyAccepted) {
                    $sessionStorage.cookiesAccepted = true;
                    exports.cookiesAccepted = true;
                }
                exports.user = user;
                exports.userHardware = user.hardware;
                getUserRole();
                loadedUserPromise.resolve();
            } else {
                exports.user = null;
                $translate.use(sessionStorage.guestLanguage || navigatorLang);
                $cookieStore.remove('token');
                exports.userRole = 'student';
                hardwareApi.getAll().then(function(response) {
                    exports.userHardware = response.data;
                }).finally(loadedUserPromise.reject);
            }
        };

        exports.itsUserLoaded = function() {
            return loadedUserPromise.promise;
        };

        exports.itsRoleLoaded = function() {
            return loadedRolePromise.promise;
        };

        exports.itsPropertyLoaded = function() {
            return loadedPropertyPromise.promise;
        };

        var md = new MobileDetect(window.navigator.userAgent);

        exports.acceptCookies = function() {
            if (exports.user) {
                userApi.update({
                    cookiePolicyAccepted: true
                });
            }
            $sessionStorage.cookiesAccepted = true;
            exports.cookiesAccepted = true;
        };

        exports.goToLogin = function() {
            var url = $location.url();
            $location.path('login').search({
                init: url
            });
        };

        exports.goToRegister = function() {
            var url = $location.url();
            $location.path('register').search({
                init: url
            });
        };

        function processRoute() {
            var pathArray = $location.path().split('/'),
                firstPathItem = pathArray[1],
                secondPathItem = pathArray[2];

            if (firstPathItem === 'help' && secondPathItem && secondPathItem === 'forum') {
                $log.debug('section', secondPathItem);
                exports.section = secondPathItem;
            } else {
                $log.debug('section', firstPathItem);
                exports.section = firstPathItem;
            }

            checkForCompatibility($location.path());
        }

        function checkForCompatibility(path) {
            if (path && path !== '' && !$sessionStorage.hasBeenWarnedAboutCompatibility) {
                if (isNaN(md.version('Chrome')) || md.version('Chrome') < 40 || md.phone() || md.tablet()) {
                    if (!exports.continueToURL) {
                        exports.continueToURL = path;
                    }
                    if (isNaN(md.version('Chrome')) && !md.phone() && !md.tablet() || md.version('Chrome') < 40 && !md.phone() && !md.tablet()) {
                        $location.path('/unsupported/desktop');
                    } else if (md.tablet()) {
                        $location.path('/unsupported/tablet');
                    } else if (md.phone()) {
                        $location.path('/unsupported/phone');
                    }
                }
            }
        }

        function getProperties() {
            $http.get(envData.config.serverUrl + 'property').success(function(items) {
                $log.debug('properties', items);
                exports.properties = items[0];

                loadedPropertyPromise.resolve();
            });
        }

        function getUserRole() {
            if (loadedRolePromise.promise.$$state.status !== 0) {
                loadedRolePromise = $q.defer();
            }
            centerModeApi.getMyRole().then(function(result) {
                if (result.data && result.data !== '') {
                    exports.userRole = result.data;
                } else {
                    exports.userRole = exports.user.role;
                }
                loadedRolePromise.resolve();
            }).catch(loadedRolePromise.reject);
        }

        if (!exports.user) {
            $log.debug('gettingUSer on common');
            User.get().$promise.then(function(user) {
                $log.debug('gettingUSer on common OK');
                if (user.username) {
                    delete user.$promise;
                    delete user.$resolved;
                    userRobotsApi.getUserRobots(user._id).then(function(res) {
                        user.thirdPartyRobots = res.data;
                    }).finally(function() {
                        exports.setUser(user);
                        exports.userIsLoaded = true;
                    });
                } else {
                    exports.userIsLoaded = true;
                    exports.setUser(null);
                }
            }, function() {
                $log.debug('gettingUSer on common KO');
                exports.userIsLoaded = true;
                exports.setUser(null);
            });

        }

        if ($sessionStorage.cookiesAccepted) {
            exports.cookiesAccepted = true;
        }

        if (navigatorLang) {
            navigatorLang = langToAngularLng[navigatorLang.split('-')[0]];
        }

        processRoute();

        exports.itsUserLoaded().finally(function() {
            getProperties();
        });

        $rootScope.$on('$locationChangeSuccess', function() {
            processRoute();
        });

        exports.saveUserLanguage = function(newLang) {
            amMoment.changeLocale(newLang);
            if (exports.user && (exports.user.language !== newLang)) {
                exports.user.language = newLang;
                userApi.update({
                    language: newLang
                }).then(function() {
                    alertsService.add({
                        text: 'account-saved',
                        id: 'saved-user',
                        type: 'ok',
                        time: 5000
                    });
                }, function() {
                    alertsService.add({
                        text: 'account-saved-error',
                        id: 'saved-user',
                        type: 'warning'
                    });
                });
            }
        };

        exports.useChromeExtension = function() {
            return (exports.os === 'ChromeOS' || exports.os === 'Mac' || (exports.user && exports.user.chromeapp));
        };

        return exports;

    });
