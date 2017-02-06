'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.exerciseService
 * @description
 * # exerciseService
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('exerciseService', function($log, $window, envData, $q, $rootScope, _, alertsService, centerModeService, ngDialog, imageApi, common, utils, $translate, bowerData, $timeout, hardwareConstants, exerciseApi, $route, $location, bloqsUtils, hw2Bloqs, commonModals, arduinoGeneration, centerModeApi) {

        var exports = {},
            savePromise,
            oldExercise = {};

        exports.bloqs = {
            varsBloq: null,
            setupBloq: null,
            loopBloq: null
        };

        exports.componentsArray = [];

        exports.exercise = {};

        var scope = $rootScope.$new();
        scope.exercise = exports.exercise;

        exports.assignGroup = function(project, teacherId, oldGroups, centerId, onlyEdit) {
            var defered = $q.defer();
            oldGroups = _.groupBy(oldGroups, '_id');
            centerModeApi.getGroups().then(function(response) {
                var groups = response.data;

                function confirmAction(groups) {
                    var selectedGroups = _.filter(groups, {'selected': true}),
                        groupsToAssign = [];
                    selectedGroups.forEach(function(group) {
                        if (group.students.length === 0) {
                            alertsService.add({
                                text: 'centerMode__alert__assignGroup-empty',
                                id: 'centerMode-assignGroup',
                                type: 'info',
                                time: 5000
                            });
                        }
                        if (group.withoutDate || !group.calendar.from.time || !group.calendar.to.time) {
                            groupsToAssign.push({
                                _id: group._id,
                                calendar: {}
                            });
                        } else {
                            group.calendar.from.date = moment(group.calendar.from.date);
                            group.calendar.to.date = moment(group.calendar.to.date);
                            var hourFrom = group.calendar.from.time.split(':')[0],
                                minutesFrom = group.calendar.from.time.split(':')[1],
                                hourTo = group.calendar.to.time.split(':')[0],
                                minutesTo = group.calendar.to.time.split(':')[1];
                            group.calendar.from.date.hour(hourFrom);
                            group.calendar.from.date.minute(minutesFrom);
                            group.calendar.to.date.hour(hourTo);
                            group.calendar.to.date.minute(minutesTo);

                            groupsToAssign.push({
                                _id: group._id,
                                calendar: {
                                    from: group.calendar.from.date,
                                    to: group.calendar.to.date
                                }
                            });
                        }
                    });
                    exerciseApi.assignGroups(project._id, groupsToAssign).then(function() {
                        defered.resolve();
                        assignModal.close();
                    });
                }

                var modalOptions = $rootScope.$new(),
                    assignModal;

                function showDatePicker(datePickerId) {
                    setTimeout(function() {
                        $('#' + datePickerId).focus();
                    }, 0);
                }

                function showTimePicker(timePickerId, event) {
                    $('#' + timePickerId).click();
                    event.stopPropagation();
                }

                function getTime(initDate) {
                    var dateString;
                    if (initDate) {
                        var momentDate = moment(initDate);
                        dateString = momentDate.hour() + ':' + momentDate.minute();
                    }
                    return dateString;
                }

                function initTimePicker() {
                    var options = {
                        twentyFour: true  //Display 24 hour format, defaults to falseç

                    };
                    $('.timepicker').wickedpicker(options);
                }

                function _newGroup() {
                    centerModeService.newGroup(teacherId, centerId).then(function(response) {
                        groups.push(response.data);
                        _.extend(modalOptions, {
                            groups: groups
                        });
                    });
                }

                _.extend(modalOptions, {
                    title: 'centerMode_editGroups',
                    contentTemplate: 'views/modals/centerMode/editGroups.html',
                    mainText: 'centerMode_editGroups_info',
                    exerciseName: project.name,
                    groups: groups,
                    confirmButton: 'save',
                    today: new Date(),
                    showDatePicker: showDatePicker,
                    showTimePicker: showTimePicker,
                    initTimePicker: initTimePicker,
                    newGroup: _newGroup,
                    getTime: getTime,
                    oldGroups: oldGroups,
                    onlyEdit: onlyEdit,
                    rejectButton: 'modal-button-cancel',
                    rejectAction: defered.reject,
                    confirmAction: confirmAction,
                    modalButtons: true
                });

                assignModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--assign-group',
                    scope: modalOptions

                });
            });
            return defered.promise;
        };

        exports.clone = function() {
            exports.completedExercise();
            commonModals.clone(exports.exercise, true, 'exercise');
        };

        exports.completedExercise = function() {
            if (exports.bloqs.varsBloq) {
                exports.exercise.software = {
                    vars: exports.bloqs.varsBloq.getBloqsStructure(),
                    setup: exports.bloqs.setupBloq.getBloqsStructure(),
                    loop: exports.bloqs.loopBloq.getBloqsStructure()
                };
            }

            _updateHardwareSchema();
            _updateHardwareTags();
            exports.exercise.code = exports.getCode();
        };

        exports.download = function(exercise, type) {
            exercise = exports.getCleanExercise(exercise || exports.exercise, true);
            type = type || 'json';
            if (type === 'arduino') {
                _downloadIno(exercise);
            } else {
                _downloadJSON(exercise);
            }

        };

        exports.saveInMyProjects = function() {
            exerciseApi.taskToProject(exports.exercise._id).then(function(newProjectId) {
                alertsService.add({
                    text: 'make-cloned-project',
                    id: 'clone-project',
                    type: 'ok',
                    time: 5000
                });
                if (newProjectId.data) {
                    var newtab = $window.open('', '_blank');
                    newtab.location = '#/bloqsproject/' + newProjectId.data;
                }
            });
        };

        exports.rename = function() {
            commonModals.rename(exports.exercise, 'exercise').then(exports.startAutosave);
        };

        /**
         * Status of save exercise
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

        exports.isEmptyComponentArray = function() {
            return _.isEqual(exports.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };

        exports.checkPublish = function(type) {
            var defered = $q.defer();
            type = type || '';
            var exerciseEmptyName = common.translate('new-exercise');
            if (!exports.exercise.name || exports.exercise.name === exerciseEmptyName) {
                if (!exports.exercise.description) {
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
                exports.exercise.name = exerciseEmptyName ? '' : exports.exercise.name;
                defered.reject();
            } else if (!exports.exercise.description) {
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
                return board.name === exports.exercise.hardware.board;
            });
        };

        exports.getRobotMetaData = function() {
            return _.find(hardwareConstants.robots, function(robot) {
                return robot.id === exports.exercise.hardware.robot;
            });
        };

        exports.getCleanExercise = function(exerciseRef, download) {
            exerciseRef = exerciseRef || exports.exercise;
            var cleanExercise = _.cloneDeep(exerciseRef);
            if (download) {
                delete cleanExercise._id;
            }
            delete cleanExercise.creator;
            delete cleanExercise.teacher;
            delete cleanExercise.createdAt;
            delete cleanExercise.updatedAt;
            delete cleanExercise.links;
            delete cleanExercise.__v;
            return cleanExercise;
        };

        exports.getCode = function() {
            var code;
            _updateHardwareSchema();
            code = arduinoGeneration.getCode({
                varsBloq: exports.bloqs.varsBloq.getBloqsStructure(true),
                setupBloq: exports.bloqs.setupBloq.getBloqsStructure(true),
                loopBloq: exports.bloqs.loopBloq.getBloqsStructure(true)
            }, exports.exercise.hardware);
            return code;
        };

        exports.getDefaultExercise = function() {
            var exercise = {
                creator: '',
                name: common.translate('new-exercise'),
                description: '',
                hardwareTags: [],
                defaultTheme: 'infotab_option_colorTheme',
                selectedBloqs: {},
                software: {
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
                },
                hardware: {
                    board: null,
                    robot: null,
                    components: [],
                    connections: []
                }
            };

            return exercise;
        };

        exports.getSavePromise = function() {
            return savePromise;
        };

        exports.getSavingStatusIdLabel = function() {
            return exports.savingStatusIdLabels[exports.saveStatus];
        };

        exports.isShared = function(exercise) {
            var found = false,
                i = 0,
                propertyNames = Object.getOwnPropertyNames(exercise._acl);
            while (!found && (i < propertyNames.length)) {
                if (propertyNames[i] !== 'ALL' && common.user && propertyNames[i].split('user:')[1] !== common.user._id) {
                    found = true;
                }
                i++;
            }
            return found;
        };

        exports.initBloqsExercise = function(watchers) {
            exports.exercise = _.extend(exports.exercise, exports.getDefaultExercise());
            exports.setComponentsArray();
            if (watchers) {
                exports.addWatchers();
            }
        };

        exports.exerciseHasChanged = function() {
            var identicalExerciseObject = _.isEqual(exports.exercise, oldExercise);
            return !identicalExerciseObject || (exports.tempImage.file);
        };

        exports.saveOldExercise = function() {
            oldExercise = _.cloneDeep(exports.exercise);
        };

        exports.setComponentsArray = function(components) {
            if (components) {
                exports.componentsArray = components;
            } else {
                exports.componentsArray = bloqsUtils.getEmptyComponentsArray();
                if (!exports.exercise.hardware.components) {
                    exports.exercise.hardware.components = [];
                    exports.exercise.hardware.connections = [];
                }
                exports.exercise.hardware.components.forEach(function(comp) {
                    if (comp.oscillator === true || comp.oscillator === 'true') {
                        exports.componentsArray.oscillators.push(_.cloneDeep(comp));
                    } else {
                        exports.componentsArray[comp.category].push(_.cloneDeep(comp));
                    }
                });

            }
        };
        //temp fix to code refactor, sensor types
        var sensorsTypes = {};
        for (var i = 0; i < hardwareConstants.components.sensors.length; i++) {
            sensorsTypes[hardwareConstants.components.sensors[i].id] = hardwareConstants.components.sensors[i].dataReturnType;
        }

        exports.setExercise = function(newExercise) {
            for (var i = 0; i < newExercise.hardware.components.length; i++) {
                if (newExercise.hardware.components[i].category === 'sensors') {
                    newExercise.hardware.components[i].dataReturnType = sensorsTypes[newExercise.hardware.components[i].id];
                }
            }
            //end temp fix

            if (_.isEmpty(exports.exercise)) {
                exports.exercise = exports.getDefaultExercise();
            }
            _.extend(exports.exercise, newExercise);
            exports.setComponentsArray();
            exports.addWatchers();
        };

        exports.startAutosave = function(hard) {
            if (exports.exercise.userCanUpdate || exports.exercise.canMark) {
                if (common.user) {
                    exports.saveStatus = 1;
                    if (hard) {
                        savePromise = _saveExercise();
                    } else if (!savePromise || (savePromise.$$state.status !== 0)) {
                        savePromise = $timeout(_saveExercise, envData.config.saveTime || 10000);
                        return savePromise;
                    }
                } else {
                    exports.completedExercise();
                    common.session.exercise = _.cloneDeep(exports.exercise);
                    common.session.save = true;
                }
            }
        };

        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        //----------------- api communication ---------------------------------
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------

        exports.getExerciseOrTask = function(id) {
            if (common.section === 'task') {
                return exerciseApi.getTask(id);
            } else {
                return exerciseApi.get(id);
            }
        };

        function _updateExerciseOrTask(exerciseId, exercise) {
            if (common.section === 'task') {
                return exerciseApi.updateTask(exerciseId, exercise);
            } else {
                return exerciseApi.update(exerciseId, exercise);
            }
        }

        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        //----------------- Private functions ---------------------------------
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------

        function _downloadIno(exercise, code) {
            code = code || exercise.code;
            var name = exercise.name;
            //Remove all diacritics
            name = utils.removeDiacritics(name, undefined, $translate.instant('new-exercise'));

            utils.downloadFile(name.substring(0, 30) + '.ino', code, 'text/plain;charset=UTF-8');
        }

        function _downloadJSON(exerciseRef) {
            exerciseRef = exerciseRef || exports.exercise;
            var exercise = exports.getCleanExercise(exerciseRef, true);
            exercise.bloqsVersion = bowerData.dependencies.bloqs;

            var filename = utils.removeDiacritics(exercise.name, undefined, $translate.instant('new-exercise'));

            utils.downloadFile(filename.substring(0, 30) + '.bitbloq', JSON.stringify(exercise), 'application/json');
        }

        function _init() {
            var def = $q.defer();
            savePromise = def.promise;
            def.resolve();
        }

        function _saveExercise() {
            var defered = $q.defer();
            if (exports.exercise.canMark) {
                if (exports.exercise.mark || exports.exercise.remark) {
                    exerciseApi.markTask(exports.exercise).then(function() {
                        exports.saveStatus = 2;
                        defered.resolve();
                    }).catch(function() {
                        exports.saveStatus = 3;
                        defered.reject();
                    });
                } else {
                    exports.saveStatus = 0;
                    defered.resolve();
                }
            } else {
                exports.completedExercise();
                if (exports.exerciseHasChanged() || exports.tempImage.file) {

                    exports.exercise.name = exports.exercise.name || common.translate('new-exercise');

                    $log.debug('Auto saving exercise...');

                    if (exports.tempImage.file && !exports.tempImage.generate) {
                        exports.exercise.image = 'custom';
                    }

                    if (exports.exercise._id) {
                        if (!exports.exercise._acl || (exports.exercise._acl['user:' + common.user._id] && exports.exercise._acl['user:' + common.user._id].permission === 'ADMIN')) {
                            return _updateExerciseOrTask(exports.exercise._id, exports.getCleanExercise())
                                .then(function() {
                                    exports.saveStatus = 2;
                                    exports.saveOldExercise();
                                    localStorage.exercisesChange = true;
                                    if (exports.tempImage.file) {
                                        imageApi.save(exports.exercise._id, exports.tempImage.file).then(function() {
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
                            exports.exercise.creator = common.user._id;
                            return exerciseApi.save(exports.getCleanExercise()).then(function(response) {
                                exports.saveStatus = 2;
                                var idExercise = response.data;
                                exports.exercise._id = idExercise;
                                exports.getExerciseOrTask(idExercise).success(function(response) {
                                    exports.exercise._acl = response._acl;
                                });
                                //to avoid reload
                                $route.current.pathParams.id = idExercise;
                                $location.url('/exercise/' + idExercise);

                                common.isLoading = false;
                                if (localStorage.exercisesChange) {
                                    localStorage.exercisesChange = !JSON.parse(localStorage.exercisesChange);
                                }
                                exports.saveOldExercise();

                                if (exports.tempImage.file) {
                                    imageApi.save(idExercise, exports.tempImage.file).then(function() {
                                        $log.debug('imageSaveok');
                                        localStorage.exercisesChange = true;
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
                    $log.debug('we cant save Exercise if there is no changes');
                    exports.saveStatus = 0;
                    defered.resolve();
                }
            }

            return defered.promise;
        }

        function _updateHardwareSchema() {
            var schema = hw2Bloqs.saveSchema();
            if (schema) { //If exercise is loaded on protocanvas
                schema.components = schema.components.map(function(elem) {
                    var newElem = exports.findComponentInComponentsArray(elem.uid);
                    if (newElem) {
                        newElem = _.extend(newElem, elem);
                    }
                    return newElem;
                });

                exports.exercise.hardware.components = _.cloneDeep(schema.components);
                exports.exercise.hardware.connections = _.cloneDeep(schema.connections);
            }
        }

        function _updateHardwareTags() {
            var newHardwareTags = [];
            var mainTag = exports.exercise.hardware.robot || exports.exercise.hardware.board;
            if (mainTag) {
                newHardwareTags.push(mainTag);
            }
            exports.exercise.hardware.components.forEach(function(comp) {
                newHardwareTags.push(comp.id);
            });
            exports.exercise.hardwareTags = _.uniq(newHardwareTags);
        }

        /*************************************************
         init functions and watchers
         *************************************************/
        _init();

        exports.addWatchers = function() {
            scope.$watch('exercise.name', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    exports.exercise.name = exports.exercise.name || common.translate('new-exercise');
                    exports.startAutosave();
                }
            });

            scope.$watch('exercise.description', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (!newVal) {
                        exports.exercise.description = '';
                    }
                    exports.startAutosave();
                }
            });

            scope.$watch('exercise.hardware.board', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    exports.startAutosave();
                }
            });

            scope.$watch('exercise.newMark[0]', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal !== String(exports.exercise.mark).split('.')[0]) {
                    exports.startAutosave();
                }
            });

            scope.$watch('exercise.newMark[1]', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal !== String(exports.exercise.mark).split('.')[1]) {
                    exports.startAutosave();
                }
            });

            scope.$watch('exercise.remark', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    exports.startAutosave();
                }
            });
        };

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
