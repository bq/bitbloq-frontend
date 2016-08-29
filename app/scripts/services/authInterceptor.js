'use strict';
angular.module('bitbloqApp')
    .service('authInterceptor', function($log, $cookieStore, $q, $routeParams, alertsService) {
        return {
            // Add authorization token to headers
            'request': function(config) {
                config.headers = config.headers || {};
                if ($cookieStore.get('token') || $routeParams.token) {
                    if (!config.skipAuthorization) {
                        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                    }
                }
                return config;
            },
            'responseError': function(rejection) {
                // do something on error
                $log.debug('responseError', rejection);
                switch (rejection.status) {
                    case 0: //server null
                        alertsService.add({
                            text: 'generic_alert_errorServerNull',
                            id: 'generic-error',
                            type: 'error'
                        });
                        break;
                    case 500: //Internal Server Error
                        alertsService.add({
                            text: 'generic_alert_errorInternalServer',
                            id: 'generic-error',
                            type: 'error'
                        });
                        break;
                    case 504: //Gateway Timeout
                        alertsService.add({
                            text: 'login-error-disconnect',
                            id: 'generic-error',
                            type: 'error'
                        });
                        break;
                }
                return $q.reject(rejection);
            }
        };
    });
