/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('AccountCtrl', function($scope, $rootScope, $timeout, $translate, $location, $q, $auth, User, envData, imageApi, userApi, _, alertsService, ngDialog, utils, common) {
        $scope.authenticate = function(prov) {
            $auth.authenticate(prov).then(function(response) {
                var options = {
                    provider: prov,
                    accessToken: response.access_token
                };
                userApi.loginBySocialNetwork(options).then(function() {
                    // Set user data
                    userApi.currentUser = User.get();
                    userApi.currentUser.$promise.then(function(user) {
                        delete user.$promise;
                        delete user.$resolved;
                        $scope.common.setUser(user);
                    });
                }, function(err) {
                    alertsService.add({
                        text: 'social-networks-error-has-identity',
                        id: 'social-network-user',
                        type: 'warning'
                    });
                    console.log('ERROR ADDING SOCIAL NETWORK: ', err);
                });
            });
        };

        function _isUserName(username) {
            var regexp = /^[0-9]*[a-zA-Z]+[a-zA-Z0-9]*$/;
            if (username.search(regexp) === -1) {
                return false;
            } else {
                return true;
            }
        }

        $scope.validateProfile = function() {
            if (usernameBackup !== $scope.common.user.username) {
                if (!_isUserName($scope.common.user.username)) {
                    alertsService.add({
                        text: 'account-change-username-alphanumeric-numeric-error',
                        id: 'saved-user',
                        type: 'error'
                    });
                } else {
                    userApi.validateUserName($scope.common.user.username).then(function(res) {
                        if (res.status === 200) {
                            alertsService.add({
                                text: 'account-change-username-repeated',
                                id: 'saved-user',
                                type: 'error'
                            });
                        } else {
                            $scope.saveProfile();
                        }
                    });
                }
            } else {
                $scope.saveProfile();
            }

        };

        $scope.saveProfile = function() {
            var defered = $q.defer();

            alertsService.add({
                text: 'account-saving',
                id: 'saved-user',
                type: 'info',
                time: 5000
            });
            if ($scope.tempAvatar.size && $scope.tempAvatar.type !== 'google' && $scope.tempAvatar.type !== 'facebook') {
                $scope.common.user.imageType = $scope.tempAvatar.type;
            }

            userApi.update($scope.common.user).then(function() {
                $scope.common.setUser($scope.common.user);
                usernameBackup = $scope.common.user.username;
                if ($scope.tempAvatar.size && $scope.tempAvatar.type !== 'google' && $scope.tempAvatar.type !== 'facebook') {
                    imageApi.save($scope.common.user._id, $scope.tempAvatar, 'avatar').success(function() {
                        $scope.common.oldTempAvatar = $scope.tempAvatar;
                        alertsService.add({
                            text: 'account-saved',
                            id: 'saved-user',
                            type: 'ok',
                            time: 5000
                        });
                        defered.resolve();
                    }).error(function(error) {
                        alertsService.add({
                            text: 'account-saved-error',
                            id: 'saved-user',
                            type: 'warning'
                        });
                        defered.reject(error);
                    });
                } else {
                    alertsService.add({
                        text: 'account-saved',
                        id: 'saved-user',
                        type: 'ok',
                        time: 5000
                    });
                    defered.resolve();
                }
            }, function(error) {
                alertsService.add({
                    text: 'account-saved-error',
                    id: 'saved-user',
                    type: 'warning'
                });
                defered.reject(error);
            });
            return defered.promise;
        };

        $scope.changeLanguage = function(language) {
            $translate.use(language);
            common.saveUserLanguage(language);
        };

        $scope.uploadImageTrigger = function(type) {
            $timeout(function() {
                if (type === 'main') {
                    $('.main-image--input').click();

                } else {
                    $('.other-image--input').click();
                }
            }, 0);
        };

        $scope.uploadImage = function(e) {
            var properties = {
                minWidth: 100,
                minHeight: 100,
                containerDest: 'avatarUser',
                without: /image.gif/
            };
            utils.uploadImage(e, properties).then(function(response) {
                $scope.tempAvatar = response.blob;
                $scope.saveProfile();
            }).catch(function(response) {
                switch (response.error) {
                    case 'heavy':
                        alertsService.add({
                            text: 'account-image-heavy-error',
                            id: 'user-avatar',
                            type: 'warning'
                        });
                        break;
                    case 'small':
                        alertsService.add({
                            text: 'account-image-small-error',
                            id: 'user-avatar',
                            type: 'warning'
                        });
                        break;
                    case 'no-image':
                        alertsService.add({
                            text: 'account-image-read-error',
                            id: 'user-avatar',
                            type: 'warning'
                        });
                        break;
                }
            });
        };
        $scope.changePassword = function() {
            var dialog,
                modalScope = $rootScope.$new(),
                confirmAction = function(form) {
                    modalScope.errorPassword = false;
                    if (_.isEmpty(form.$error)) {
                        if (form.passwordMain.$modelValue === form.passwordRepeat.$modelValue) {
                            var newPassword = form.passwordMain.$modelValue;
                            userApi.changePasswordAuthenticated(newPassword).then(function() {
                                alertsService.add({
                                    text: 'reset-password-saved',
                                    id: 'saved-password',
                                    type: 'ok',
                                    time: 5000
                                });
                                dialog.close();
                            }, function() {
                                alertsService.add({
                                    text: 'reset-password-saved-error',
                                    id: 'error-password',
                                    type: 'warning'
                                });
                            });
                        } else {
                            modalScope.errorPassword = true;
                        }
                    }
                };

            _.extend(modalScope, {
                title: 'modal-reset-password-title',
                confirmButton: 'modal-reset-password-button-ok',
                contentTemplate: 'views/modals/resetPassword.html',
                confirmAction: confirmAction,
                submitted: false,
                errorPassword: false
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container password-reset--modal',
                scope: modalScope,
                showClose: false
            });

            $('textarea.msd-elastic').autogrow({
                onInitialize: true
            });
        };

        $scope.common.oldTempAvatar = {};
        $scope.test = envData.config.supportedLanguages;
        $scope.translate = $translate;
        $scope.tempAvatar = {};
        $scope.avatarUpdate = false;
        var usernameBackup = null;

        $scope.common.itsUserLoaded().then(function() {
            usernameBackup = $scope.common.user.username;
            $scope.$watch('common.user.firstName', function(oldValue, newValue) {
                if (oldValue && oldValue !== newValue) {
                    $scope.validateProfile();
                }
            });

            $scope.$watch('common.user.username', function(newValue, oldValue) {
                if (oldValue && newValue && oldValue !== newValue) {
                    $scope.validateProfile();
                }
            });

            $scope.$watch('common.user.newsletter', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal !== '' && $scope.common.user !== null) {
                    $scope.validateProfile();
                }
            });

            $scope.$watch('common.user.lastName', function(oldValue, newValue) {
                if (oldValue && oldValue !== newValue) {
                    $scope.validateProfile();
                }
            });

        }, function() {
            alertsService.add({
                text: 'view-need-tobe-logged',
                id: 'login',
                type: 'warning'
            });
            $location.path('/login');
        });

    });
