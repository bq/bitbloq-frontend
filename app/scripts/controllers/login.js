/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('LoginCtrl', function($scope, User, envData, $log, userApi, _, $cookieStore, $http, $auth, $location, $q, $rootScope, moment, alertsService, ngDialog, $routeParams, $translate) {
        $scope.focusHandler = function(evt) {
            $scope.focus = evt.currentTarget.name;
        };

        $scope.authenticate = function(prov) {
            localStorage.removeItem('satellizer_token');
            $cookieStore.remove('token');
            $auth.authenticate(prov).then(function(response) {
                var options = {
                    provider: prov,
                    accessToken: response.access_token
                };

                $scope.providerOptions = options;

                userApi.loginBySocialNetwork($scope.providerOptions).then(function(loginResponse) {
                        // Set user data
                        if (loginResponse.status === 204) {
                            $scope.isSocialRegister = true;
                        } else {
                            $cookieStore.put('token', loginResponse.data.token);
                            userApi.currentUser = User.get();
                            userApi.currentUser.$promise.then(function(user) {
                                $scope.common.setUser(user);
                                if ($scope.common.user.hasBeenAskedIfTeacher || $scope.common.user.newsletter) {
                                    _goToHome();
                                } else {
                                    teacherModal();
                                }
                            });
                        }
                    },
                    function(err) {
                        console.log('LOGIN ERROR: ', err);
                    });

            });

        };

        $scope.loginSubmit = function(form) {
            $scope.errors.login.emailUserName = false;
            $scope.errors.login.password = false;
            if (!form.emailusername.$invalid && !form.password.$invalid) {
                if (_.indexOf(form.emailUserNameModel, '@') !== -1) {
                    $scope.user.email = form.emailUserNameModel;
                    delete $scope.user.username;
                } else {
                    $scope.user.username = form.emailUserNameModel.toLowerCase();
                    delete $scope.user.email;
                }
                login();
            } else {
                fireShakeEffect();
            }
        };

        $scope.register = function(form) {
            $scope.errors.register = {
                email: false,
                birthday: false,
                emptyBirthday: false,
                disconnect: false
            };

            $scope.errors.login.emailUserName = false;
            $scope.errors.login.password = false;
            $scope.errors.disconnect = false;

            if (form.birthday && form.birthday.day && form.birthday.month && form.birthday.year) {
                $scope.errors.emptyBirthday = !moment(form.birthday.day + ', ' + form.birthday.month + ', ' + form.birthday.year, 'DD, MM, YYYY').isValid();
                if (!$scope.errors.emptyBirthday) {
                    $scope.user.birthday = new Date(form.birthday.year, form.birthday.month - 1, form.birthday.day);
                    var older = new Date();
                    older.setYear(older.getFullYear() - 14);
                    $scope.errors.birthday = $scope.user.birthday >= older;
                } else {
                    fireShakeEffect();
                }
            } else {
                fireShakeEffect();
                $scope.errors.emptyBirthday = true;
                $scope.errors.birthday = false;
            }

            function _validateRegister() {
                return !form.email.$invalid && !form.password.$invalid && !$scope.username.invalid && !form.username.$error.required && $scope.username.free && $scope.user.cookiePolicyAccepted && !$scope.errors.birthday && !$scope.errors.emptyBirthday;
            }

            if (_validateRegister()) {
                $scope.user.username = $scope.user.username.toLowerCase();
                $scope.user.hasBeenAskedIfTeacher = true;
                $scope.user.language = $translate.use();
                userApi.registerUser($scope.user, function(err) {
                    if (err) {
                        throw err;
                    }
                    login(true);
                }, function(res) {
                    fireShakeEffect();
                    var errors = res.data.errors;
                    if (errors.email) {
                        $scope.errors.register.email = true;
                    }
                    if (errors.username) {
                        $scope.username.free = false;
                    }
                    $log.debug('register error: ', res);
                });
            } else {
                fireShakeEffect();
            }

        };

        $scope.registerSocial = function(form) {
            $scope.checkUserName().then(function() {
                if ($scope.username.search && $scope.username.free && !$scope.username.invalid && !form.readServiceTerm.$error.required && !form.usernameSocial.$error.required) {
                    var user = $scope.common.user || {};
                    user.username = form.usernameSocial.$modelValue;
                    user.hasBeenAskedIfTeacher = true;

                    _.extend($scope.providerOptions, {
                        'register': true
                    }, {
                        'username': user.username
                    }, {
                        'hasBeenAskedIfTeacher': user.hasBeenAskedIfTeacher
                    });

                    userApi.loginBySocialNetwork($scope.providerOptions).then(function(response) {
                        $cookieStore.put('token', response.data.token);
                        userApi.currentUser = User.get();
                        userApi.currentUser.$promise.then(function(user) {
                            $scope.common.setUser(user);
                            if ($scope.common.user.hasBeenAskedIfTeacher || $scope.common.user.newsletter) {
                                _goToHome();
                            } else {
                                teacherModal();
                            }
                        });
                    });
                } else {
                    fireShakeEffect();
                }
            });
        };

        $scope.checkUserName = function() {
            var defered = $q.defer();
            $scope.focus = false;
            if ($scope.user.username !== userName) {
                $scope.username.search = false;
                userName = $scope.user.username;
                $scope.username.invalid = false;
                if ($scope.user.username && $scope.user.username !== '') {
                    if (isUserName()) {
                        $scope.username.empty = false;
                        $scope.username.searching = true;
                        userApi.validateUserName($scope.user.username.toLowerCase()).then(function(res) {
                            if (res.status === 200) {
                                $scope.username.searching = false;
                                $scope.username.search = true;
                                $scope.username.free = false;
                                defered.resolve(false);
                            } else {
                                $scope.username.searching = false;
                                $scope.username.free = true;
                                $scope.username.search = true;
                                defered.resolve(true);
                            }
                        });
                    } else {
                        $scope.username.invalid = true;
                        defered.resolve(false);
                    }
                } else {
                    defered.resolve(false);
                }
            } else {
                defered.resolve(false);
            }
            return defered.promise;
        };

        function transitionForm(item) {
            item.addClass('form--login__container--transition-down');
            item.bind('webkitAnimationEnd', function() {
                $(this).addClass('hide-container');
                $(this).removeClass('form--login__container--transition-down');
            });
            var $loginContainer = angular.element('#loginContainer');
            $loginContainer.addClass('form--login__container--transition-up');
            $loginContainer.removeClass('hide-container');
            $loginContainer.bind('webkitAnimationEnd', function() {
                $(this).removeClass('form--login__container--transition-up');
                $(this).removeClass('hide-container');
            });
        }

        $scope.setLoginFromRegister = function() {
            $scope.isLogin = true;
            var $registerContainer = angular.element('#registerContainer');
            transitionForm($registerContainer);
        };

        $scope.setLoginFromForgotPassword = function() {
            var $forgotPasswordContainer = angular.element('#isForgotPassword');
            transitionForm($forgotPasswordContainer);
        };

        $scope.setForgotPassword = function() {
            var $loginContainer = angular.element('#loginContainer');
            transitionForm($loginContainer);
        };

        $scope.setForgotPasswordFromRegister = function() {
            var $registerContainer = angular.element('#registerContainer');
            transitionForm($registerContainer);
        };

        $scope.setRegister = function() {
            $scope.isLogin = false;
            var $loginContainer = angular.element('#loginContainer');
            transitionForm($loginContainer);
        };

        $scope.forgotPassword = function(formForgot) {
            $scope.recovery.emailError = false;
            if (_.isEmpty(formForgot.$error)) {
                userApi.getUserId(formForgot.emailToSend.$modelValue).then(function() {
                    userApi.forgottenPassword(formForgot.emailToSend.$modelValue).then(function() {
                        $scope.recovery.success = true;
                        $scope.recovery.error = false;
                        alertsService.add({
                            text: 'email-recovery-password-ok',
                            id: 'recovery-password',
                            type: 'ok',
                            time: 5000
                        });
                    }, function() {
                        fireShakeEffect();
                        $scope.recovery.success = false;
                        $scope.recovery.error = true;
                    });
                }, function() {
                    fireShakeEffect();
                    $scope.recovery.emailError = true;
                });
            } else {
                fireShakeEffect();
            }
        };

        function _goToHome() {
            if ($routeParams.init) {
                $location.url(decodeURIComponent($routeParams.init));
            } else {
                $location.path('projects');
            }
        }

        function teacherModal() {
            var confirmAction = function() {
                    $scope.common.user.hasBeenAskedIfTeacher = true;
                    if ($scope.radioTeacher.model === 'teacher') {
                        $scope.common.user.isTeacher = true;
                    } else {
                        $scope.common.user.isTeacher = false;
                    }
                    userApi.update($scope.common.user).then(function() {
                        $scope.common.setUser($scope.common.user);
                        modalTeacher.close();
                        _goToHome();
                    }, function(err) {
                        $log.log('Error', err);
                    });
                },
                modalTeacher,
                modalOptions = $scope;
            $scope.radioTeacher = {
                model: ''
            };
            _.extend(modalOptions, {
                confirmOnly: true,
                contentTemplate: '/views/modals/teacher.html',
                confirmAction: confirmAction
            });

            modalTeacher = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--teacher',
                scope: modalOptions,
                showClose: false,
                closeByDocument: false
            });
        }

        function login(register) {
            if ($scope.user.username) {
                $scope.user.username = $scope.user.username.toLowerCase();
            }
            var options = {
                email: $scope.user.email || $scope.user.username,
                password: $scope.user.password
            };
            userApi.loginUser(options).then(function(user) {
                $scope.common.setUser(user);
                if (user.hasBeenAskedIfTeacher || user.newsletter || register) {
                    _goToHome();
                } else {
                    teacherModal();
                }
            }).catch(function(error) {
                console.log('Error loggin in', error);
                fireShakeEffect();
                if (error) {
                    switch (error.status) {
                        case 401:
                            $scope.errors.login.emailUserName = false;
                            $scope.errors.login.password = true;
                            $scope.errors.disconnect = false;
                            break;
                        case 404:
                            $scope.errors.login.emailUserName = true;
                            $scope.errors.login.password = false;
                            $scope.errors.disconnect = false;
                            break;
                        case 500:
                            $scope.errors.login.emailUserName = false;
                            $scope.errors.login.password = false;
                            $scope.errors.disconnect = true;
                            break;
                        default:

                    }

                    //     //{error: "no_such_principal", errorDescription: "Unknown basic user credentials."}
                    //     if ($scope.user.username) {
                    //         userApi.validateUserName($scope.user.username.toLowerCase()).success(function () {
                    //             $scope.errors.login.password = true;
                    //             $scope.errors.login.emailUserName = false;
                    //         }).error(function () {
                    //             $scope.errors.login.emailUserName = true;
                    //             $scope.errors.login.password = false;
                    //         });
                    //     } else {
                    //         userApi.getUserId($scope.user.email).success(function () {
                    //             $scope.errors.login.password = true;
                    //             $scope.errors.login.emailUserName = false;
                    //         }).error(function () {
                    //             $scope.errors.login.emailUserName = true;
                    //             $scope.errors.login.password = false;
                    //         });
                    //     }
                    //     $scope.errors.disconnect = false;
                    // } else {
                    //     $scope.errors.login.emailUserName = false;
                    //     $scope.errors.login.password = false;
                    //     $scope.errors.disconnect = true;

                }
            });
        }

        function isUserName() {
            var regexp = /^[0-9]*[a-zA-Z]+[a-zA-Z0-9]*$/;
            if ($scope.user.username.search(regexp) === -1) {
                return false;
            } else {
                return true;
            }
        }

        function fireShakeEffect() {
            angular.element('[data-effect="shake"]').addClass('shake');
            setTimeout(function() {
                angular.element('[data-effect="shake"]').removeClass('shake');
            }, 250);
        }

        $scope.envData = envData;
        $scope.isLogin = true;
        $scope.isSocialRegister = false;
        $scope.isForgotPassword = false;
        $scope.checked = false;

        $scope.user = {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            birthday: null,
            cookiePolicyAccepted: false,
            newsletter: false,
            takeTour: false,
            language: 'es-ES',
            hasFirstComponent: false
        };
        $scope.username = {
            invalid: false,
            free: true,
            searching: false,
            search: false
        };
        $scope.errors = {
            login: {
                password: false,
                emailUserName: false
            },
            register: {
                email: false,
                birthday: false,
                emptyBirthday: false,
                socialEmail: false
            },
            disconnect: false
        };
        $scope.recovery = {
            emailError: false,
            success: false,
            error: false
        };
        $scope.providerOptions = {};
        var userName;

        switch ($location.path()) {
            case '/register':
                $scope.isLogin = false;
                break;
            case '/resetpassword':
                $scope.isForgotPassword = true;
                break;
        }

        $scope.common.itsUserLoaded().then(function() {
            if ($scope.common.user.hasBeenAskedIfTeacher || $scope.common.user.newsletter) {
                _goToHome();
            } else {
                teacherModal();
            }
        });
    });
