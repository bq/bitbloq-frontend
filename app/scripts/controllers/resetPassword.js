/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ResetPasswordCtrl
 * @description
 * # ResetPasswordCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ResetPasswordCtrl', function($scope, $cookieStore, $routeParams, User, alertsService, $location, _, common) {

        var tryAgainToastId;
        $scope.createPassword = function(form) {

            var password = form.passwordMain.$modelValue,
                confirmPassword = form.passwordRepeat.$modelValue;
            $scope.errorPassword = false;

            if (_.isEmpty(form.$error)) {
                if (password === confirmPassword) {
                    User.get().$promise.then(function(user) {
                        User.changePassword({
                            id: user._id
                        }, {
                            newPassword: password
                        }, function() {
                            alertsService.add({
                                text: 'recovery-create-password-ok',
                                id: 'password',
                                type: 'ok',
                                time: 5000
                            });
                            $location.path('login');
                        }, function() {
                            common.setUser(null);
                            tryAgainToastId = alertsService.add({
                                text: 'recovery-create-password-error',
                                id: 'password',
                                type: 'warning',
                                linkText: 'from-here',
                                link: goToResetPassword
                            });
                        });
                    }, function(err) {
                        tryAgainToastId = alertsService.add({
                            text: 'recovery-create-password-error',
                            id: 'password',
                            type: 'warning',
                            linkText: 'from-here',
                            link: goToResetPassword
                        });
                        console.log('error getting the user: ', err);
                        common.setUser(null);
                    });

                } else {
                    $scope.errorPassword = true;
                }
            }
        };

        function goToResetPassword() {
            if (tryAgainToastId) {
                alertsService.close(tryAgainToastId);
            }
            $location.path('/resetpassword');
        }

        $scope.errorPassword = false;
        $scope.common.section = 'recovery';

        common.itsUserLoaded().finally(function() {
            var token = $routeParams.token;
            common.setUser(null);
            $cookieStore.put('token', token);

        });
    });