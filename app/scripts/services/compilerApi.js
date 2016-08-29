'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.CompilerApi
 * @description
 * # CompilerApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('compilerApi', function(envData, $http) {
        var exports = {
            compile: compile
        };

        function compile(data) {

            return $http({
                method: 'POST',
                url: envData.config.compilerUrl + 'compile',
                data: data
            });
        }

        return exports;
    });