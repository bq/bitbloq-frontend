'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.userApi
 * @description
 * # userApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('userApi', function($http, $cookieStore, $q, User, envData, _, utils) {

        var exports = {},
            userRoles = ['admin', 'user', 'guest'];

        function hasUserRole(r, h) {
            return userRoles.indexOf(r) >= userRoles.indexOf(h);
        }

        exports.currentUser = {};

        exports.me = function() {
            return User.get();
        };

        exports.getCurrentUser = function(callback) {
            if (arguments.length === 0) {
                return exports.currentUser;
            }
            var value = (exports.currentUser.hasOwnProperty('$promise')) ? exports.currentUser.$promise : exports.currentUser;
            return $q.when(value)
                .then(function(user) {
                    utils.safeCb(callback)(user);
                    return user;
                }, function() {
                    utils.safeCb(callback)({});
                    return {};
                });
        };

        exports.isLoggedIn = function(callback) {
            if (arguments.length === 0) {
                return exports.currentUser.hasOwnProperty('role');
            }

            return exports.getCurrentUser(null).then(function(user) {
                var is = user.hasOwnProperty('role');
                utils.safeCb(callback)(is);
                return is;
            });
        };

        exports.hasRole = function hasRole(role, callback) {

            if (arguments.length < 2) {
                return hasUserRole(exports.currentUser.role, role);
            }

            return exports.getCurrentUser(null)
                .then(function(user) {
                    var has = (user.hasOwnProperty('role')) ?
                        hasUserRole(user.role, role) : false;
                    utils.safeCb(callback)(has);
                    return has;
                });
        };

        exports.registerUser = function(options, callback, errorCallback) {
            return User.save(options, function(data) {
                $cookieStore.put('token', data.token);
                exports.currentUser = User.get();
                return utils.safeCb(callback)(null, data.token);
            }, function(err) {
                return errorCallback(err);
            });
        };

        exports.getToken = function() {
            return $cookieStore.get('token');
        };

        exports.loginBySocialNetwork = function(options) {
            return $http.post(envData.config.serverUrl + 'user/social', options);
        };
        exports.turnSocialToLocal = function(password, callback) {
            return User.turnToLocal({
                id: 'me'
            }, {
                newPassword: password
            }, function() {
                return utils.safeCb(callback)(null);
            }, function(err) {
                return utils.safeCb(callback)(err);
            }).$promise;
        };

        exports.loginUser = function(options, callback) {
            return $http.post(envData.config.serverUrl + 'auth/local', {
                email: options.email,
                password: options.password
            }).then(function(res) {
                $cookieStore.put('token', res.data.token);
                exports.currentUser = User.get();
                return exports.currentUser.$promise.then(function(user) {
                    utils.safeCb(callback)(null, user);
                    delete user.$promise;
                    delete user.$resolved;
                    return user;
                });
            }).catch(function(err) {
                exports.logout();
                utils.safeCb(callback)(null, err.data);
                return $q.reject(err);
            });
        };

        exports.logout = function() {
            $cookieStore.remove('token');
            exports.currentUser = {};
        };

        exports.validateUserName = function(username) {
            return $http.head(envData.config.serverUrl + 'user/' + username);
        };

        exports.update = function(dataUser) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'user/me',
                data: dataUser
            });
        };

        exports.getSocialProfile = function(provider, token) {
            if (provider === 'google') {
                return $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
            } else if (provider === 'facebook') {
                return $http.get('https://graph.facebook.com/me?access_token=' + token);
            }
        };

        exports.addSocialNetwork = function(dataProvider) {
            return exports.update(dataProvider);
        };

        exports.forgottenPassword = function(email) {
            return $http({
                method: 'POST',
                url: envData.config.serverUrl + 'user/forgot',
                data: {
                    email: email
                }
            });
        };

        exports.getUserId = function(email) {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'user/email/' + encodeURIComponent(email)
            });
        };

        exports.getAliasByACL = function(acl) {
            var users = [];
            for (var item in acl) {
                if (acl[item].permission === 'READ' && item !== 'ALL') {
                    users.push(acl[item].properties.email);
                }
            }
            return users;
        };

        exports.getUsersByEmail = function(emails) {
            var userIds = [],
                promises = [],
                deferedMain = $q.defer();

            emails.forEach(function(email) {
                var defered = $q.defer();
                promises.push(defered.promise);
                exports.getUserId(email).then(function(response) {
                    var user = {
                        userId: response.data.id,
                        email: email
                    };
                    userIds.push(user);
                    defered.resolve(user);
                }).catch(function() {
                    defered.resolve();
                });
            });

            $q.all(promises).then(function() {
                deferedMain.resolve(userIds);
            });

            return deferedMain.promise;
        };

        exports.getAllUsers = function() {
            return $http.get(envData.config.serverUrl + 'user/');
        };

        /*
         ****** only admin user
         */
        exports.banUser = function(userId) {
            return $http({
                method: 'HEAD',
                url: envData.config.serverUrl + 'user/' + userId + '/ban'
            });
        };

        exports.unbanUser = function(userId) {
            return $http({
                method: 'HEAD',
                url: envData.config.serverUrl + 'user/' + userId + '/unban'
            });
        };

        exports.getBannedUsers = function() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'user/banned'
            });
        };

        exports.changePasswordAuthenticated = function(newPassword, callback) {
            return User.changePasswordAuthenticated({
                id: 'me'
            }, {
                newPassword: newPassword
            }, function() {
                return utils.safeCb(callback)(null);
            }, function(err) {
                return utils.safeCb(callback)(err);
            }).$promise;
        };

        //***********************

        return exports;
    });
