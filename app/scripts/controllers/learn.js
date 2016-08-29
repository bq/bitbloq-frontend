'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LearnCtrl
 * @description
 * # LearnCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('LearnCtrl', function($scope, commonModals) {

        $scope.commonModals = commonModals;
        $scope.diwoURL = 'http://diwo.bq.com/';

        $scope.$watch('common.user.language', function(newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                $scope.diwoURL = 'http://diwo.bq.com/';
            }
        });

    });
