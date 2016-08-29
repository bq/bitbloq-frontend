(function() {
    /*jshint bitwise: false*/
    'use strict';

    /**
     * @ngdoc service
     * @name bitbloqApp.allResources
     * @description
     * # Common service to create common requests.
     * Service in the bitbloqApp.
     */
    angular.module('bitbloqApp').factory('resource', resourceApi);

    function resourceApi($http, $q, utils, envData) {

        var exports = {
            get: get,
            getAll: getAll
        };

        return exports;

        function get(endpoint, queryParams) {

            queryParams = queryParams || {};

            return $http({
                method: 'GET',
                url: envData.config.serverUrl + endpoint,
                params: queryParams
            });

        }

        function getAll(endpoint, queryParams, resultArray, promise) {
            var defered = promise || $q.defer();
            resultArray = resultArray || [];
            queryParams = queryParams || {};

            get(endpoint, queryParams).then(function(response) {
                resultArray = resultArray.concat(response.data);
                if (response.data.length === queryParams.pageSize) {
                    queryParams.page++;
                    getAll(endpoint, queryParams, resultArray, defered);
                } else {
                    defered.resolve(resultArray);
                }
            }, function(error) {
                defered.reject(error.data);
            });
            return defered.promise;
        }
    }

})();