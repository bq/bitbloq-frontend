'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.projectApi
 * @description
 * # projectApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('projectApi', function($http, $log, $window, envData, $q, $rootScope, _, alertsService, imageApi, userApi, common, utils, ngDialog, $translate, resource, bowerData, $timeout) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var exports = {},
            savePromise;

        //Private functions
        function startSavePromise() {
            var defer = $q.defer();
            savePromise = defer.promise;
            defer.resolve();
        }

        function saveRequest(params) {
            return $http(params)
                .then(function(response) {
                    exports.saveStatus = 2;
                    return response;
                }, function(error) {
                    $log.debug('Save error: ', error);
                    if (error.status === 405 || error.status === 401) {
                        alertsService.add({
                            text: 'session-expired',
                            id: 'session',
                            type: 'warning'
                        });
                    }
                    exports.saveStatus = 3;
                    return error;
                });
        }

        function addDownload(idProject) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/download'
            });
        }

        //Public functions
        exports.get = function(id, params) {
            params = params || {};
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/' + id,
                params: params
            });
        };

        exports.getPublic = function(queryParams) {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project',
                params: queryParams
            });

        };

        exports.getPublicCounter = function(queryParams) {
            angular.extend(queryParams, {
                'count': '*'
            });
            return exports.getPublic(queryParams);
        };

        exports.getMyProjects = function(queryParams) {

            var myProjectArray = [],
                params = {
                    'page': 0,
                    'pageSize': 30
                };

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return resource.getAll('project/me', params, myProjectArray);
        };

        exports.getMySharedProjects = function(queryParams) {

            var myProjectArray = [],
                params = {
                    'page': 0,
                    'pageSize': 30
                };

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return resource.getAll('project/shared', params, myProjectArray);
        };

        exports.startAutosave = function(saveProject) {
            if (common.user) {
                exports.saveStatus = 1;
                if (!savePromise || (savePromise.$$state.status !== 0)) {
                    savePromise = $timeout(saveProject, envData.config.saveTime || 10000);
                    return savePromise;
                }
            } else {
                common.session.save = true;
            }
        };

        exports.save = function(dataProject) {
            return saveRequest({
                method: 'POST',
                url: envData.config.serverUrl + 'project',
                data: dataProject
            });
        };

        exports.getSavePromise = function() {
            return savePromise;
        };

        exports.getSavingStatusIdLabel = function() {
            return exports.savingStatusIdLabels[exports.saveStatus];
        };

        exports.update = function(idProject, dataProject) {
            return saveRequest({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject,
                data: dataProject
            });
        };

        exports.clone = function(idProject, name) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/clone',
                data: {
                    name: name
                }
            });
        };

        exports.publish = function(project) {
            var defered = $q.defer();
            $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + project._id + '/publish'
            }).then(function(response) {
                project._acl.ALL = {
                    permission: 'READ',
                    properties: {
                        date: Date.now()
                    }
                };
                defered.resolve(response);
            }, function(error) {
                defered.reject(error);
            });
            return defered.promise;
        };

        exports.private = function(project) {
            var defered = $q.defer();
            $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + project._id + '/private'
            }).then(function(response) {
                delete project._acl.ALL;
                defered.resolve(response);
            }, function(error) {
                defered.reject(error);
            });
            return defered.promise;
        };

        exports.shareWithUsers = function(idProject, userEmails) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/share',
                data: userEmails
            });
        };

        exports.delete = function(idProject) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'project/' + idProject
            });
        };

        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------

        exports.getShortURL = function(longUrl) {
            // Request short url
            return $http.post('https://www.googleapis.com/urlshortener/v1/url?key=' + envData.google.apikey, {
                longUrl: longUrl
            }).success(function(response) {
                return response.id;
            }).error(function(error) {
                return error.error.message;
            });
        };

        exports.generateShortUrl = function(longUrl) {
            return $http({
                method: 'POST',
                url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyA4NIAP4k3TA0kpo6POxWcS_2-Rpj_JaoE',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    longUrl: longUrl
                },
                skipAuthorization: true
            });
        };

        exports.isShared = function(project) {
            var found = false,
                i = 0,
                propertyNames = Object.getOwnPropertyNames(project._acl);
            while (!found && (i < propertyNames.length)) {
                if (propertyNames[i] !== 'ALL' && common.user && propertyNames[i].split('user:')[1] !== common.user._id) {
                    found = true;
                }
                i++;
            }
            return found;
        };

        exports.getCleanProject = function(projectRef) {
            var cleanProject = _.cloneDeep(projectRef);
            delete cleanProject._id;
            delete cleanProject._acl;
            delete cleanProject.creator;
            delete cleanProject.createdAt;
            delete cleanProject.updatedAt;
            delete cleanProject.links;
            delete cleanProject.exportedFromBitbloqOffline;
            delete cleanProject.bitbloqOfflineVersion;
            return cleanProject;
        };

        exports.download = function(project, type, force) {
            type = type || 'json';
            if (common.user || force) {
                addDownload(project._id).then(function(response) {
                    if (type === 'arduino') {
                        downloadIno(response.data);
                    } else {
                        downloadJSON(response.data);
                    }
                });
            } else {
                if (type === 'arduino') {
                    downloadIno(project);
                } else {
                    downloadJSON(project);
                }
            }
        };

        function downloadJSON(projectRef) {
            var project = exports.getCleanProject(projectRef);
            project.bloqsVersion = bowerData.dependencies.bloqs;

            var filename = utils.removeDiacritics(project.name, undefined, $translate.instant('new-project'));

            utils.downloadFile(filename.substring(0, 30) + '.bitbloq', JSON.stringify(project), 'application/json');
        }

        function downloadIno(project, code) {
            code = code || project.code;
            var name = project.name;
            //Remove all diacritics
            name = utils.removeDiacritics(name, undefined, $translate.instant('new-project'));

            utils.downloadFile(name.substring(0, 30) + '.ino', code, 'text/plain;charset=UTF-8');
        }

        /**
         * Status of save project
         * 0 = Nothing
         * 1 = AutoSaving in progress
         * 2 = Save correct
         * 3 = Saved Error
         * 4 = Dont Allowed to do Save
         * @type {Number}
         */
        exports.saveStatus = 0;

        exports.savingStatusIdLabels = {
            0: '',
            1: 'make-saving',
            2: 'make-project-saved-ok',
            3: 'make-project-saved-ko',
            4: 'make-project-not-allow-to-save'
        };

        //Init functions
        startSavePromise();

        $rootScope.$on('$locationChangeStart', function(event) {
            if (exports.saveStatus === 1) {
                var answer = $window.confirm($translate.instant('leave-without-save') + '\n\n' + $translate.instant('leave-page-question'));
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        $window.onbeforeunload = function(event) {
            if (exports.saveStatus === 1) {
                var answer = $window.confirm($translate.instant('leave-without-save') + '\n\n' + $translate.instant('leave-page-question'));
                if (!answer) {
                    event.preventDefault();
                }
            }
        };

        return exports;
    });
