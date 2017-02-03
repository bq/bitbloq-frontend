'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.projectApi
 * @description
 * # projectApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('projectService', function($log, $window, envData, $q, $rootScope, _, alertsService, imageApi,
        common, utils, $translate, bowerData, $timeout, hardwareConstants, projectApi, $route, $location,
        bloqsUtils, hw2Bloqs, commonModals, arduinoGeneration, userApi) {

        var exports = {},
            thereAreWatchers = false,
            thereAreCodeProjectWatchers = false,
            savePromise,
            oldProject = {},
            boardWatcher,
            codeWatcher,
            nameWatcher,
            descriptionWatcher,
            videoUrlWatcher;

        exports.bloqs = {
            varsBloq: null,
            setupBloq: null,
            loopBloq: null
        };

        exports.componentsArray = [];

        exports.project = {};

        var scope = $rootScope.$new();
        scope.project = exports.project;

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

        exports.tempImage = {};

        exports.addComponentInComponentsArray = function(category, newComponent) {
            exports.componentsArray[category].push(newComponent);
        };

        exports.removeComponentInComponentsArray = function(category, componentName) {
            _.remove(exports.componentsArray[category], {
                name: componentName
            });
        };

        exports.isEmptyComponentArray = function() {
            return _.isEqual(exports.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };

        exports.checkPublish = function(type) {
            var defered = $q.defer();
            type = type || '';
            var projectEmptyName = common.translate('new-project');
            if (!exports.project.name || exports.project.name === projectEmptyName) {
                if (!exports.project.description) {
                    alertsService.add({
                        text: 'publishProject__alert__nameDescriptionError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    alertsService.add({
                        text: 'publishProject__alert__nameError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                }
                exports.project.name = projectEmptyName ? '' : exports.project.name;
                defered.reject();
            } else if (!exports.project.description) {
                alertsService.add({
                    text: 'publishProject__alert__descriptionError' + type,
                    id: 'publishing-project',
                    type: 'warning'
                });
                defered.reject();
            } else {
                defered.resolve();
            }
            return defered.promise;
        };

        exports.clone = function() {
            exports.completedProject();
            commonModals.clone(exports.project, true);
        };

        exports.completedProject = function() {
            if (!exports.project.codeProject) {
                if (exports.bloqs.varsBloq) {
                    exports.project.software = {
                        vars: exports.bloqs.varsBloq.getBloqsStructure(),
                        setup: exports.bloqs.setupBloq.getBloqsStructure(),
                        loop: exports.bloqs.loopBloq.getBloqsStructure()
                    };
                }

                _updateHardwareSchema();
                _updateHardwareTags();
                exports.project.code = exports.getCode();
            }
        };

        exports.download = function(project, type, force) {
            project = project || exports.project;
            type = type || 'json';
            if ((common.user && project._id) || force) {
                projectApi.addDownload(project._id).then(function(response) {
                    if (type === 'arduino') {
                        _downloadIno(response.data);
                    } else {
                        _downloadJSON(response.data);
                    }
                });
            } else {
                if (type === 'arduino') {
                    _downloadIno(project);
                } else {
                    _downloadJSON(project);
                }
            }
        };

        exports.findComponentInComponentsArray = function(myUid) {
            var myComponent;
            _.forEach(exports.componentsArray, function(element) {
                var tmpComponent = _.find(element, function(item) {
                    return item.uid === myUid;
                });
                if (tmpComponent) {
                    myComponent = tmpComponent;
                }
            });
            return myComponent;
        };

        exports.getBoardMetaData = function() {
            return _.find(hardwareConstants.boards, function(board) {
                return board.name === exports.project.hardware.board;
            });
        };

        exports.getRobotMetaData = function() {
            return _.find(hardwareConstants.robots, function(robot) {
                return robot.id === exports.project.hardware.robot;
            });
        };

        exports.getCleanProject = function(projectRef, download) {
            projectRef = projectRef || exports.project;
            var cleanProject = _.cloneDeep(projectRef);
            if (download) {
                delete cleanProject._id;
                delete cleanProject._acl;
            }
            delete cleanProject.creator;
            delete cleanProject.createdAt;
            delete cleanProject.updatedAt;
            delete cleanProject.links;
            delete cleanProject.exportedFromBitbloqOffline;
            delete cleanProject.bitbloqOfflineVersion;
            delete cleanProject.__v;
            return cleanProject;
        };

        exports.getCode = function() {
            var code;
            if (exports.codeProject) {
                code = exports.project.code;
            } else {
                _updateHardwareSchema();
                var hardware = _.cloneDeep(exports.project.hardware);
                if (exports.project.useBitbloqConnect && exports.project.hardware.board === 'bq ZUM' && exports.project.bitbloqConnectBT) {
                    hardware.components.push(exports.project.bitbloqConnectBT);
                }
                code = arduinoGeneration.getCode({
                    varsBloq: exports.bloqs.varsBloq.getBloqsStructure(true),
                    setupBloq: exports.bloqs.setupBloq.getBloqsStructure(true),
                    loopBloq: exports.bloqs.loopBloq.getBloqsStructure(true)
                }, hardware);
            }
            return code;
        };

        exports.getDefaultProject = function(code) {
            var project = {
                creator: '',
                name: common.translate('new-project'),
                description: '',
                userTags: [],
                hardwareTags: [],
                videoUrl: '',
                defaultTheme: 'infotab_option_colorTheme',
                codeProject: !!code
            };
            if (code === 'code') {
                project.hardware = {
                    board: 'bq ZUM'
                };
                project.code = '/***   Included libraries  ***/\n\n\n/***   Global variables and function definition  ***/\n\n\n/***   Setup  ***/\n\nvoid setup(){\n\n}\n\n/***   Loop  ***/\n\nvoid loop(){\n\n}';
            } else {
                project.software = {
                    vars: {
                        enable: true,
                        name: 'varsBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    setup: {
                        enable: true,
                        name: 'setupBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    loop: {
                        enable: true,
                        name: 'loopBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    freeBloqs: []
                };
                project.hardware = {
                    board: null,
                    robot: null,
                    components: [],
                    connections: []
                };
            }

            return project;
        };

        exports.getSavePromise = function() {
            return savePromise;
        };

        exports.getSavingStatusIdLabel = function() {
            return exports.savingStatusIdLabels[exports.saveStatus];
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

        exports.initBloqsProject = function(watchers) {
            _unBlindAllWatchers();
            exports.project = _.extend(exports.project, exports.getDefaultProject());
            if (!_.isEmpty(exports.project)) {
                exports.codeProject = false;
            }
            exports.setComponentsArray();
            if (watchers) {
                exports.addWatchers();
            }
        };

        exports.initCodeProject = function(watchers) {
            _unBlindAllWatchers();
            if (_.isEmpty(exports.project)) {
                exports.project = _.extend(exports.project, exports.getDefaultProject('code'));
            } else if (_.isEqual(exports.getDefaultProject(), exports.project) || exports.project.code === '') {
                exports.project.hardware = {
                    board: 'bq ZUM'
                };
                exports.project.code = '/***   Included libraries  ***/\n\n\n/***   Global variables and function definition  ***/\n\n\n/***   Setup  ***/\n\nvoid setup(){\n\n}\n\n/***   Loop  ***/\n\nvoid loop(){\n\n}';
                exports.project.codeProject = true;
            }
            if (watchers) {
                exports.addCodeWatchers();
            }
        };

        exports.projectHasChanged = function() {
            var identicalProjectObject = _.isEqual(exports.project, oldProject);
            return !identicalProjectObject || (exports.tempImage.file);
        };

        exports.saveOldProject = function() {
            oldProject = _.cloneDeep(exports.project);
        };

        exports.rename = function() {
            commonModals.rename(exports.project).then(exports.startAutosave);
        };

        exports.setComponentsArray = function(components) {
            if (components) {
                exports.componentsArray = components;
            } else {
                exports.componentsArray = bloqsUtils.getEmptyComponentsArray();
                if (!exports.project.hardware.components) {
                    exports.project.hardware.components = [];
                    exports.project.hardware.connections = [];
                }
                exports.project.hardware.components.forEach(function(comp) {
                    if (comp.oscillator === true || comp.oscillator === 'true') {
                        exports.componentsArray.oscillators.push(_.cloneDeep(comp));
                    } else {
                        exports.componentsArray[comp.category].push(_.cloneDeep(comp));
                    }
                });
            }

            if (exports.project.useBitbloqConnect && (exports.project.hardware.board === 'bq ZUM') && exports.project.bitbloqConnectBT) {
                exports.addComponentInComponentsArray('serialElements', exports.project.bitbloqConnectBT);
            }
        };
        //temp fix to code refactor, sensor types
        var sensorsTypes = {};
        for (var i = 0; i < hardwareConstants.components.sensors.length; i++) {
            sensorsTypes[hardwareConstants.components.sensors[i].id] = hardwareConstants.components.sensors[i].dataReturnType;
        }
        exports.setProject = function(newproject, type, watcher) {
            if (newproject.hardware.components) {
                for (var i = 0; i < newproject.hardware.components.length; i++) {
                    if (newproject.hardware.components[i].category === 'sensors') {
                        newproject.hardware.components[i].dataReturnType = sensorsTypes[newproject.hardware.components[i].id];
                    }
                }
            }

            //end temp fix

            _unBlindAllWatchers();
            newproject.codeProject = type === 'code' ? true : newproject.codeProject;
            if (_.isEmpty(exports.project)) {
                exports.project = exports.getDefaultProject(newproject.codeProject);
            }
            exports.project = _.extend(exports.project, newproject);
            exports.setComponentsArray();
            if (watcher) {
                if (type === 'code') {
                    exports.addCodeWatchers();
                } else {
                    exports.addWatchers();
                }
            }
        };

        exports.startAutosave = function(hard) {
            if (common.user) {
                exports.saveStatus = 1;
                if (hard) {
                    savePromise = _saveProject();
                } else if (!savePromise || (savePromise.$$state.status !== 0)) {
                    savePromise = $timeout(_saveProject, envData.config.saveTime || 10000);
                    return savePromise;
                }
            } else {
                exports.completedProject();
                common.session.project = _.cloneDeep(exports.project);
                common.session.save = true;
            }
        };
        exports.saveTwitterApp = function() {
            var defered = $q.defer();

            userApi.update(common.user).then(function() {
                common.setUser(common.user);
                alertsService.add({
                    text: 'account-saved',
                    id: 'saved-user',
                    type: 'ok',
                    time: 5000
                });
                defered.resolve();
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

        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        //----------------- Private functions ---------------------------------
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------

        function _downloadIno(project, code) {
            code = code || project.code;
            var name = project.name;
            //Remove all diacritics
            name = utils.removeDiacritics(name, undefined, $translate.instant('new-project'));

            utils.downloadFile(name.substring(0, 30) + '.ino', code, 'text/plain;charset=UTF-8');
        }

        function _downloadJSON(projectRef) {
            projectRef = projectRef || exports.project;
            var project = exports.getCleanProject(projectRef, true);
            project.bloqsVersion = bowerData.dependencies.bloqs;

            var filename = utils.removeDiacritics(project.name, undefined, $translate.instant('new-project'));

            utils.downloadFile(filename.substring(0, 30) + '.bitbloq', JSON.stringify(project), 'application/json');
        }

        function _init() {
            var def = $q.defer();
            savePromise = def.promise;
            def.resolve();
        }

        function _saveProject() {
            var defered = $q.defer();
            exports.completedProject();
            if (exports.projectHasChanged() || exports.tempImage.file) {

                exports.project.name = exports.project.name || common.translate('new-project');

                $log.debug('Auto saving project...');

                if (exports.tempImage.file && !exports.tempImage.generate) {
                    exports.project.image = 'custom';
                }

                if (exports.project._id) {
                    if (!exports.project._acl || (exports.project._acl['user:' + common.user._id] && exports.project._acl['user:' + common.user._id].permission === 'ADMIN')) {
                        return projectApi.update(exports.project._id, exports.getCleanProject()).then(function(response) {
                            if (response.status === 200) {
                                exports.saveStatus = 2;
                                exports.saveOldProject();
                                localStorage.projectsChange = true;
                            } else {
                                exports.saveStatus = 3;
                            }
                            if (exports.tempImage.file) {
                                imageApi.save(exports.project._id, exports.tempImage.file).then(function() {
                                    exports.tempImage = {};
                                });
                            }
                        });
                    } else {
                        exports.saveStatus = 4;
                        defered.reject();
                    }
                } else {
                    if (common.user) {
                        exports.project.creator = common.user._id;
                        return projectApi.save(exports.getCleanProject()).then(function(response) {
                            exports.saveStatus = 2;
                            var idProject = response.data;
                            exports.project._id = idProject;
                            projectApi.get(idProject).success(function(response) {
                                exports.project._acl = response._acl;
                            });
                            //to avoid reload
                            $route.current.pathParams.id = idProject;
                            if (exports.project.codeProject) {
                                $location.url('/codeproject/' + idProject);
                            } else {
                                $location.url('/bloqsproject/' + idProject);
                            }

                            common.isLoading = false;
                            if (localStorage.projectsChange) {
                                localStorage.projectsChange = !JSON.parse(localStorage.projectsChange);
                            }
                            exports.saveOldProject();

                            if (exports.tempImage.file) {
                                imageApi.save(idProject, exports.tempImage.file).then(function() {
                                    $log.debug('imageSaveok');
                                    localStorage.projectsChange = true;
                                    exports.tempImage = {};
                                });
                            }
                        }).catch(function() {
                            exports.saveStatus = 3;
                            defered.reject();
                        });
                    } else {
                        exports.saveStatus = 0;
                        $log.debug('why we start to save if the user its not logged??, check startAutoSave');
                        defered.reject();
                    }
                }
            } else {
                $log.debug('we cant save Project if there is no changes');
                exports.saveStatus = 0;
                defered.resolve();
            }

            return defered.promise;
        }

        function _thereIsWatcher(variable) {
            var result = _.find(scope.$$watchers, function(item) {
                return item.exp === variable;
            });
            return !!result;
        }

        function _updateHardwareSchema() {
            if (!exports.project.hardware.robot) {
                var schema = hw2Bloqs.saveSchema();
                if (schema) { //If project is loaded on protocanvas
                    schema.components = schema.components.map(function(elem) {
                        var newElem = exports.findComponentInComponentsArray(elem.uid);
                        if (newElem) {
                            newElem = _.extend(newElem, elem);
                        }
                        return newElem;
                    });

                    exports.project.hardware.components = _.cloneDeep(schema.components);
                    exports.project.hardware.connections = _.cloneDeep(schema.connections);
                }
            }
        }

        function _updateHardwareTags() {
            var newHardwareTags = [];
            var mainTag = exports.project.hardware.robot || exports.project.hardware.board;
            if (mainTag) {
                newHardwareTags.push(mainTag);
            }
            if (exports.project.bitbloqConnectBT) {
                newHardwareTags.push('Bitbloq Connect');
            }
            exports.project.hardware.components.forEach(function(comp) {
                newHardwareTags.push(comp.id);
            });

            if (exports.project.useBitbloqConnect) {
                newHardwareTags.push('bitbloqconnect');
            }
            exports.project.hardwareTags = _.uniq(newHardwareTags);
        }

        /*************************************************
         init functions and watchers
         *************************************************/
        _init();

        exports.addWatchers = function() {
            if (!thereAreWatchers) {
                thereAreWatchers = true;
                nameWatcher = scope.$watch('project.name', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        exports.project.name = exports.project.name || common.translate('new-project');
                        exports.startAutosave();
                    }
                });

                descriptionWatcher = scope.$watch('project.description', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        if (!newVal) {
                            exports.project.description = '';
                        }
                        exports.startAutosave();
                    }
                });

                videoUrlWatcher = scope.$watch('project.videoUrl', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        if (!utils.isYoutubeURL(newVal) && newVal) {
                            alertsService.add({
                                text: 'validate-videourl',
                                id: 'save-project',
                                type: 'warning'
                            });
                        } else {
                            exports.startAutosave();
                        }
                    }
                });

                boardWatcher = scope.$watch('project.hardware.board', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        exports.startAutosave();
                    }
                });
            } else if (!_thereIsWatcher('project.hardware.board')) {
                boardWatcher = scope.$watch('project.hardware.board', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        exports.startAutosave();
                    }
                });
            }
        };

        exports.addCodeWatchers = function() {
            if (!thereAreCodeProjectWatchers) {
                thereAreCodeProjectWatchers = true;
                codeWatcher = scope.$watch('project.code', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        exports.startAutosave();
                    }
                });
                exports.addWatchers();
            }
        };

        function _unBlindAllWatchers() {
            if (thereAreCodeProjectWatchers) {
                _unBlindCodeProjectWatchers();
            }
            if (thereAreWatchers) {
                _unBlindGenericWatchers();
            }
        }

        function _unBlindGenericWatchers() {
            thereAreWatchers = false;
            if (_thereIsWatcher('project.hardware.board')) {
                boardWatcher();
            }
            if (_thereIsWatcher('project.name')) {
                nameWatcher();
            }
            if (_thereIsWatcher('project.description')) {
                descriptionWatcher();
            }
            if (_thereIsWatcher('project.videoUrl')) {
                videoUrlWatcher();
            }
        }

        function _unBlindCodeProjectWatchers() {
            thereAreCodeProjectWatchers = false;
            if (_thereIsWatcher('project.hardware.board')) {
                boardWatcher();
            }
            if (_thereIsWatcher('project.code')) {
                codeWatcher();
            }
        }

        $rootScope.$on('$locationChangeStart', function(event) {
            if (exports.saveStatus === 1) {
                var answer = $window.confirm($translate.instant('leave-without-save') + '\n\n' + $translate.instant('leave-page-question'));
                if (!answer) {
                    event.preventDefault();
                }
            }
        });
        return exports;
    });