'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ProjectCtrl
 * @description
 * # ProjectCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ProjectCtrl', function($routeParams, $scope, $location, projectApi, alertsService, utils, _, $window, common, commonModals) {

        $scope.countAdded = function() {
            //model updated in projectApi
            $scope.project.timesAdded = $scope.project.timesAdded + 1;
        };

        $scope.openProject = function(project) {
            if (common.user && !project._acl['user:' + common.user._id]) {
                project.timesViewed++;
            }
            if (project.codeProject) {
                $window.open('#/codeproject/' + project._id);
            } else {
                $window.open('#/bloqsproject/' + project._id);
            }
        };

        if ($routeParams.id) {
            projectApi.get($routeParams.id, {
                profile: true
            }).then(function(response) {
                $scope.project = response.data;
                if ($scope.project.videoUrl) {
                    $scope.videoID = utils.isYoutubeURL($scope.project.videoUrl);
                    $scope.imageShown = $scope.videoID;
                } else {
                    $scope.imageShown = '';
                }
                projectApi.getShortURL($location.$$absUrl).then(function(data) {
                    $scope.project.shortUrl = data.data.id;
                });
            }, function(response) {
                switch (response.status) {
                    case 404:
                        alertsService.add({
                            text: 'no-project',
                            id: 'error-project',
                            type: 'warning'
                        });
                        break;
                    case 401: //unauthorized
                        alertsService.add({
                            text: 'alert_text_errorProjectUnauthorized',
                            id: 'load-project',
                            type: 'warning'
                        });
                        break;
                    default:
                        alertsService.add({
                            text: 'alert_text_errorProjectUndefined',
                            id: 'error-project',
                            type: 'warning'
                        });
                }
            });
        }

        $scope.projectApi = projectApi;
        $scope.utils = utils;
        $scope.commonModals = commonModals;
        // $scope.project.shortUrl = requestShortUrl($location.path());
    });