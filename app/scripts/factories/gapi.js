'use strict';
angular.module('bitbloqApp')
    .factory('gapi', function($window) {
        return $window.gapi;
    });
