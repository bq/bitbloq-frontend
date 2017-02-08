'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqsexerciseCtrl
 * @description
 * # BloqsexerciseCtrl
 * Controller of the bitbloqApp
 */

angular.module('bitbloqApp')
    .controller('ExerciseCtrl', function($rootScope, $route, $scope, $log, $timeout, $routeParams, $document, $window, $location,
        $q, web2board, alertsService, ngDialog, _, bloqs, bloqsUtils, utils, userApi, commonModals, hw2Bloqs, web2boardOnline,
        exerciseService, hardwareConstants, chromeAppApi, centerModeApi, exerciseApi) {

        /*************************************************
         Exercise settings
         *************************************************/

        var compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.groups = [];

        $scope.hardware = {
            componentList: null,
            robotList: null,
            cleanSchema: null,
            sortToolbox: null,
            firstLoad: true
        };

        $scope.exerciseApi = exerciseApi;
        $scope.currentProject = exerciseService.exercise;
        $scope.currentProjectService = exerciseService;
        $scope.currentProject.canMark = false;
        $scope.currentProject.userCanUpdate = false;
        $scope.currentProject.newMark = [];

        exerciseService.saveStatus = 0;

        exerciseService.initBloqsExercise();
        $scope.currentProjectLoaded = $q.defer();

        $scope.getGroups = function() {
            centerModeApi.getGroupsByExercise($routeParams.id).then(function(response) {
                $scope.groups = response.data;
            });
        };

        $scope.onTime = function() {
            var now = moment(),
                isEarly = true,
                isLate = false;
            if (!$scope.currentProject.initDate || now.diff($scope.currentProject.initDate) >= 0) {
                isEarly = false;
                isLate = true;
                if (!$scope.currentProject.endDate || now.diff($scope.currentProject.endDate) <= 0) {
                    isLate = false;
                }
            }
            //It's "on time" when return [inf, sup](limits) -> [true, true]
            return [!isEarly, !isLate];
        };

        $scope.setGroups = function(groups){
          $scope.groups = groups;
        };

        $scope.sendTask = function(task) {
            var dialog,
                parent = $rootScope,
                modalOptions = parent.$new(),
                confirmAction = function() {
                    exerciseApi.sendTask(task ? task._id : $scope.currentProject._id).then(function() {
                        alertsService.add({
                            text: 'centerMode__alert__sendTask-ok',
                            id: 'publishing-project',
                            type: 'info',
                            time: 5000
                        });
                        $scope.currentProject.status = 'delivered';
                    }).catch(function() {
                        alertsService.add({
                            text: 'centerMode__alert__sendTask-error',
                            id: 'publishing-project',
                            type: 'warning'
                        });
                    });
                    dialog.close();
                };

            _.extend(modalOptions, {
                title: 'centerMode__modal__sendTask',
                confirmButton: 'send',
                confirmAction: confirmAction,
                rejectButton: 'modal-button-cancel',
                textContent: 'centerMode__modal__sendTask-mainText',
                secondaryContent: 'centerMode__modal__sendTask-secondaryText',
                contentTemplate: '/views/modals/information.html',
                modalButtons: true
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--input',
                scope: modalOptions
            });
        };

        function _canUpdate() {
            var defered = $q.defer();
            if ($scope.common.section === 'task' && $scope.currentProject.student === $scope.common.user._id) {
                $scope.currentProject.userCanUpdate = true;
                defered.resolve();
            } else {
                if ($scope.currentProject.student !== $scope.common.user._id && ($scope.currentProject.teacher === $scope.common.user._id || $scope.currentProject.owner !== $scope.common.user._id)) {
                    if ($scope.common.section === 'exercise') {
                        $scope.currentProject.userCanUpdate = true;
                    } else {
                        $scope.currentProject.canMark = true;
                    }
                    defered.resolve();
                } else {
                    exerciseApi.userIsHeadMaster($scope.currentProject._id).then(function(response) {
                        $scope.currentProject.canMark = response.data.headMaster;
                        defered.resolve();
                    }).catch(defered.reject);
                }
            }
            return defered.promise;
        }

        function _generateMark() {
            if ($scope.currentProject.mark) {
                var mark = String($scope.currentProject.mark).split('.');
                $scope.currentProject.newMark[0] = mark[0] || 0;
                $scope.currentProject.newMark[1] = mark[1] || 0;
            }
        }

        /*************************************************
         exercise save / edit
         *************************************************/

        $scope.anyComponent = function(forceCheck) {
            if ($scope.currentTab === 0 && !forceCheck) { //software Toolbox not visible
                return false;
            }
            return exerciseService.exercise.hardware.components.length !== 0;
        };
        $scope.anyAdvancedComponent = function() {
            return !_.isEqual(exerciseService.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };
        $scope.anySerialComponent = function() {
            return exerciseService.componentsArray.serialElements.length > 0;
        };

        $scope.setCode = function(code) {
            $scope.code = code;
        };

        $scope.uploadFileExercise = function(exercise) {
            if ($scope.hardware.cleanSchema) {
                $scope.hardware.cleanSchema();
            }
            _uploadExercise(exercise);
            $scope.$broadcast('refresh-bloqs');
        };

        $scope.updateBloqs = function() {

            if (exerciseService.bloqs.varsBloq) {

                var allBloqs = bloqs.bloqs;
                var allComponents = [];

                //Why?
                for (var bloq in allBloqs) {
                    allBloqs[bloq].componentsArray = exerciseService.componentsArray;
                }

                var updateBloq = function(element, list) {

                    var tempValue,
                        tempRef;

                    tempRef = element.dataset.reference;
                    tempValue = element.dataset.value;

                    bloqsUtils.drawDropdownOptions($(element), list);

                    if (tempRef && tempValue) {

                        var componentRef = list.find(function(comp) {
                            return comp.uid === tempRef;
                        });

                        if (componentRef) {
                            element.value = componentRef.name;
                            element.dataset.reference = componentRef.uid;
                            element.dataset.value = componentRef.name;
                        }

                    } else {
                        $log.debug('dropdown not selected');
                        element.selectedIndex = 0;
                    }
                };
                var bloqCanvasEl = null;
                //Update dropdowns values from bloqs canvas
                for (var type in exerciseService.componentsArray) {
                    bloqCanvasEl = document.getElementsByClassName('bloqs-tab')[0];
                    var nodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="' + type + '"]');
                    for (var i = 0, len = nodeList.length; i < len; i++) {
                        updateBloq(nodeList[i], exerciseService.componentsArray[type]);
                    }
                    allComponents = allComponents.concat(exerciseService.componentsArray[type]);
                }
                //Update dropdowns from bloqs of toolbox
                if (bloqCanvasEl) {
                    var toolboxNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="varComponents"]');
                    for (var j = 0, len2 = toolboxNodeList.length; j < len2; j++) {
                        updateBloq(toolboxNodeList[j], allComponents);
                    }

                    var varServos = [];
                    varServos = varServos.concat(exerciseService.componentsArray.servos, exerciseService.componentsArray.oscillators, exerciseService.componentsArray.continuousServos);
                    var servosNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="allServos"]');
                    for (var y = 0, lenServo = servosNodeList.length; y < lenServo; y++) {
                        updateBloq(servosNodeList[y], varServos);
                    }
                }

            }
        };

        /*************************************************
         Tab settings
         *************************************************/
        $scope.currentTab = 2;

        $scope.setTab = function(index) {
            if ($scope.currentProject.userCanUpdate && !_.isEqual($scope.currentProject, exerciseService.getDefaultExercise())) {
                exerciseService.startAutosave(true);
            }
            switch (index) {
                case 0:
                    hw2Bloqs.repaint();
                    break;
                case 1:
                    if ($scope.toolbox.level !== 1) {
                        $scope.toolbox.level = 1;
                    }
                    $scope.setCode($scope.getCode());
                    $rootScope.$emit('currenttab:bloqstab');
                    break;
            }

            $scope.currentTab = index;
        };

        $scope.disableUndo = function(currentTab, hardwareHistory, bloqsHistory) {
            var condition = false;
            switch (currentTab) {
                case 0:
                    condition = hardwareHistory.pointer <= 1;
                    break;
                case 1:
                    condition = bloqsHistory.pointer < 1;
                    break;
            }
            return condition;
        };

        $scope.disableRedo = function(currentTab, hardwareHistory, bloqsHistory) {
            var condition = false;
            switch (currentTab) {
                case 0:
                    condition = !((hardwareHistory.pointer < (hardwareHistory.history.length)) && hardwareHistory.pointer >= 1);
                    break;
                case 1:
                    condition = (bloqsHistory.pointer >= (bloqsHistory.history.length - 1));
                    break;
            }
            return condition;
        };

        $scope.undo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.undoHardwareStep();
                    break;
                case 1:
                    $scope.undoBloqStep();
                    break;
            }
        };

        $scope.redo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.redoHardwareStep();
                    break;
                case 1:
                    $scope.redoBloqStep();
                    break;
            }
        };

        $scope.toggleCollapseHeader = function() {
            $scope.collapsedHeader = !$scope.collapsedHeader;
            hw2Bloqs.repaint();
        };

        $scope.publishexercise = function(type) {
            type = type || '';
            exerciseService.checkPublish(type).then(function() {
                var exerciseDefault = exerciseService.getDefaultExercise();
                exerciseService.completedExercise();
                delete exerciseDefault.software.freeBloqs;
                if (_.isEqual(exerciseDefault.software, $scope.currentProject.software)) {
                    alertsService.add({
                        text: 'publishProject__alert__bloqsProjectEmpty' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    $scope.publishExerciseError = false;
                    if (type === 'Social') {
                        commonModals.shareSocialModal($scope.currentProject);
                    } else {
                        commonModals.publishModal($scope.currentProject);
                    }
                }
            }).catch(function() {
                $scope.publishExerciseError = true;
                $scope.setTab(2);
            });
        };

        /*************************************************
         UNDO / REDO
         *************************************************/

        //Stores one step in the history
        $scope.saveBloqStep = function(step) {
            //$log.debug('Guardamos Estado de Bloqs');
            var freeBloqs = bloqs.getFreeBloqs();
            //$log.debug(freeBloqs);
            step = step || {
                vars: exerciseService.bloqs.varsBloq.getBloqsStructure(),
                setup: exerciseService.bloqs.setupBloq.getBloqsStructure(),
                loop: exerciseService.bloqs.loopBloq.getBloqsStructure(),
                freeBloqs: freeBloqs
            };
            if ($scope.bloqsHistory.pointer !== ($scope.bloqsHistory.history.length - 1)) {
                $scope.bloqsHistory.history = _.take($scope.bloqsHistory.history, $scope.bloqsHistory.pointer + 1);
            }
            $scope.bloqsHistory.history.push(_.cloneDeep(step));

            $scope.bloqsHistory.pointer++;

        };

        $scope.undoBloqStep = function() {
            //$log.log('undo bloq', $scope.bloqsHistory.pointer, $scope.bloqsHistory.history.length);
            if ($scope.bloqsHistory.pointer > 0) {
                $scope.bloqsHistory.pointer--;

                var step = $scope.bloqsHistory.history[$scope.bloqsHistory.pointer];
                $scope.currentProject.software = step;

                $rootScope.$emit('update-bloqs');
                exerciseService.startAutosave();
            }
        };

        $scope.redoBloqStep = function() {
            //$log.log('redo bloq', $scope.bloqsHistory.pointer, $scope.bloqsHistory.history.length);
            if ($scope.bloqsHistory.pointer < ($scope.bloqsHistory.history.length - 1)) {
                $scope.bloqsHistory.pointer++;

                var step = $scope.bloqsHistory.history[$scope.bloqsHistory.pointer];
                $scope.currentProject.software = step;

                $rootScope.$emit('update-bloqs');
                exerciseService.startAutosave();
            }

        };

        function addExerciseWatchersAndListener() {
            exerciseService.addWatchers();

            $window.addEventListener('bloqs:dragend', onBloqsDragEndHandler);
            $window.addEventListener('bloqs:suggestedAdded', onBloqsSuggestedAddedHandler);
            $window.addEventListener('bloqs:connect', onBloqsConnectHandler);
            $window.addEventListener('bloqs:change', onBloqsChangeHandler);
        }

        function onBloqsDragEndHandler() {
            $scope.saveBloqStep();
            exerciseService.startAutosave();
            utils.apply($scope);
        }

        function onBloqsSuggestedAddedHandler() {
            $scope.saveBloqStep();
            utils.apply($scope);
        }

        function onBloqsConnectHandler() {
            exerciseService.startAutosave();
            utils.apply($scope);
        }

        function onBloqsChangeHandler() {
            if (exerciseService.bloqs.loopBloq) {
                $scope.saveBloqStep();
                exerciseService.startAutosave();
                utils.apply($scope);
            }
        }

        function checkBackspaceKey(event) {
            if (event.which === 8 &&
                event.target.nodeName !== 'INPUT' &&
                event.target.nodeName !== 'SELECT' &&
                event.target.nodeName !== 'TEXTAREA' && !$document[0].activeElement.attributes['data-bloq-id']) {

                event.preventDefault();
            }
        }

        $scope.toolbox = {};
        $scope.toolbox.level = 1;

        //'Mad science', objects mantain reference, primitive values can't be passed for generic functions
        $scope.bloqsHistory = {
            pointer: -1, //-1 never set state, 0 first state
            history: []
        };
        $scope.hardwareHistory = {
            pointer: 0,
            history: []
        };

        $scope.commonModals = commonModals;
        $scope.utils = utils;

        /*************************************************
         Load exercise
         *************************************************/
        $scope.common.isLoading = true;
        $scope.hwBasicsLoaded = $q.defer();

        $scope.initHardwarePromise = function() {
            $scope.hwBasicsLoaded = $q.defer();
        };

        $scope.common.itsUserLoaded().then(function() {
            $log.debug('There is a registed user');
            if ($routeParams.id) {
                loadExercise($routeParams.id).finally(function() {
                    addExerciseWatchersAndListener();
                });
            } else {
                addExerciseWatchersAndListener();
                $scope.hwBasicsLoaded.promise.then(function() {
                    $scope.$emit('drawHardware');
                });
                $scope.currentProjectLoaded.resolve();
            }
        }, function() {
            $log.debug('no registed user');
            if ($routeParams.id) {
                loadExercise($routeParams.id).finally(function() {
                    addExerciseWatchersAndListener();
                });
            } else {
                addExerciseWatchersAndListener();
            }
        });

        function loadExercise(id) {
            return exerciseService.getExerciseOrTask(id).then(function(response) {
                _uploadExercise(response.data);
                _canUpdate().then(function() {
                    _generateMark();
                });
                if ($scope.common.section === 'exercise') {
                    $scope.getGroups();
                }
                $scope.currentProjectLoaded.resolve();
            }, function(error) {
                exerciseService.addWatchers();
                $scope.currentProjectLoaded.reject();
                switch (error.status) {
                    case 404: //not_found
                        alertsService.add({
                            text: 'no-project',
                            id: 'load-project',
                            type: 'warning'
                        });
                        break;
                    case 401: //unauthorized
                        $location.path('/exercise/');
                        alertsService.add({
                            text: 'alert_text_errorProjectUnauthorized',
                            id: 'load-project',
                            type: 'warning'
                        });
                        break;
                    default:
                        alertsService.add({
                            text: 'alert_text_errorProjectUndefined',
                            id: 'load-project',
                            type: 'warning'
                        });
                }
            });
        }

        function _uploadExercise(exercise) {
            if (exercise.software) {
                exercise.software.freeBloqs = exercise.software.freeBloqs || [];
            }

            exerciseService.setExercise(exercise);
            $scope.saveBloqStep(_.clone(exercise.software));
            exerciseService.saveOldExercise();
            $scope.hwBasicsLoaded.promise.then(function() {
                $scope.$emit('drawHardware');
            });
            $scope.$broadcast('refresh-bloqs');
        }

        function confirmExit() {
            var closeMessage;
            chromeAppApi.stopSerialCommunication();
            utils.apply($scope);

            if (exerciseService.saveStatus === 1) {
                closeMessage = $scope.common.translate('leave-without-save');
            }
            return closeMessage;
        }

        $document.on('keydown', checkBackspaceKey);
        $window.onbeforeunload = confirmExit;

        $scope.$on('$destroy', function() {
            $document.off('keydown', checkBackspaceKey);
            $window.onbeforeunload = null;
            _destroyWeb2boardEvents();
        });

        /*************************************************
         web2board communication
         *************************************************/

        var w2bDisconnectedEvent = $rootScope.$on('web2board:disconnected', function() {
            web2board.setInProcess(false);
        });

        var w2bVersionEvent = $rootScope.$on('web2board:wrong-version', function() {
            web2board.setInProcess(false);
        });

        var w2bNow2bEvent = $rootScope.$on('web2board:no-web2board', function() {
            alertsService.close(compilingAlert);
            alertsService.close(settingBoardAlert);
            web2board.setInProcess(false);
        });

        var w2bCompileErrorEvent = $rootScope.$on('web2board:compile-error', function(event, error) {
            error = JSON.parse(error);
            alertsService.add({
                text: 'alert-web2board-compile-error',
                id: 'compile',
                type: 'warning',
                value: error.stdErr
            });
            web2board.setInProcess(false);
        });

        var w2bCompileVerifiedEvent = $rootScope.$on('web2board:compile-verified', function() {
            alertsService.add({
                text: 'alert-web2board-compile-verified',
                id: 'compile',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        var w2bBoardReadyEvent = $rootScope.$on('web2board:boardReady', function(evt, data) {
            data = JSON.parse(data);
            if (data.length > 0) {
                if (!alertsService.isVisible('uid', serialMonitorAlert)) {
                    alertsService.add({
                        text: 'alert-web2board-boardReady',
                        id: 'upload',
                        type: 'ok',
                        time: 5000,
                        value: data[0]
                    });
                }
            } else {
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        });

        var w2bBoardNotReadyEvent = $rootScope.$on('web2board: boardNotReady', function() {
            alertsService.add({
                text: 'alert-web2board-boardNotReady',
                id: 'upload',
                type: 'warning'
            });
            web2board.setInProcess(false);
        });

        var w2bUploadingEvent = $rootScope.$on('web2board:uploading', function(evt, port) {
            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'upload',
                type: 'loading',
                value: port
            });
            web2board.setInProcess(true);
        });

        var w2bCodeUploadedEvent = $rootScope.$on('web2board:code-uploaded', function() {
            alertsService.add({
                text: 'alert-web2board-code-uploaded',
                id: 'upload',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        var w2bUploadErrorEvent = $rootScope.$on('web2board:upload-error', function(evt, data) {
            data = JSON.parse(data);
            if (!data.error) {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning',
                    value: data.stdErr
                });
            } else if (data.error === 'no port') {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning'
                });
            } else {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning',
                    value: data.error
                });
            }
            web2board.setInProcess(false);
        });

        var w2bNoPortFoundEvent = $rootScope.$on('web2board:no-port-found', function() {
            $scope.currentTab = 0;
            $scope.levelOne = 'boards';
            web2board.setInProcess(false);
            alertsService.close(serialMonitorAlert);
            alertsService.add({
                text: 'alert-web2board-no-port-found',
                id: 'upload',
                type: 'warning'
            });
        });

        var w2bSerialOpenedEvent = $rootScope.$on('web2board:serial-monitor-opened', function() {
            alertsService.close(serialMonitorAlert);
            web2board.setInProcess(false);
        });

        $scope.isWeb2BoardInProgress = web2board.isInProcess;

        function _destroyWeb2boardEvents() {
            w2bDisconnectedEvent();
            w2bVersionEvent();
            w2bNow2bEvent();
            w2bCompileErrorEvent();
            w2bCompileVerifiedEvent();
            w2bBoardReadyEvent();
            w2bBoardNotReadyEvent();
            w2bUploadingEvent();
            w2bCodeUploadedEvent();
            w2bUploadErrorEvent();
            w2bNoPortFoundEvent();
            w2bSerialOpenedEvent();
        }

        function uploadW2b1() {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.currentProject.hardware.board) {
                web2board.setInProcess(true);
                var boardReference = exerciseService.getBoardMetaData();
                settingBoardAlert = alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });

                web2board.upload(boardReference, $scope.getPrettyCode());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function uploadW2b2() {
            if ($scope.currentProject.hardware.board) {
                web2board.upload(exerciseService.getBoardMetaData().mcu, $scope.getPrettyCode());
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function verifyW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            web2board.setInProcess(true);

            compilingAlert = alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'compile',
                type: 'loading'
            });
            web2board.setInProcess(true);

            web2board.verify($scope.getPrettyCode());
        }

        function verifyW2b2() {
            web2board.verify($scope.getPrettyCode());
        }

        function serialMonitorW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.currentProject.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                var boardReference = exerciseService.getBoardMetaData();
                web2board.serialMonitor(boardReference);
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });

            }
        }

        function serialMonitorW2b2() {
            if ($scope.currentProject.hardware.board) {
                web2board.serialMonitor(exerciseService.getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        }

        function plotterW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.currentProject.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                //todo....
                var boardReference = exerciseService.getBoardMetaData();
                web2board.plotter(boardReference);
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });

            }
        }

        function plotterW2b2() {
            if ($scope.currentProject.hardware.board) {
                web2board.plotter(exerciseService.getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        }

        $scope.getComponents = function(componentsArray) {
            var components = {};

            var serialPort = _.find(componentsArray, function(o) {
                return o.id === 'sp';
            });
            if (serialPort) {
                components.sp = serialPort.name;
            }
            _.forEach(componentsArray, function(value) {
                if (hardwareConstants.viewerSensors.indexOf(value.id) !== -1) {
                    if (components[value.id]) {
                        components[value.id].names.push(value.name);
                    } else {
                        components[value.id] = {};
                        components[value.id].type = value.type;
                        components[value.id].names = [value.name];
                    }
                }
            });
            return components;
        };

        $scope.getViewerCode = function(componentsArray, originalCode) {
            var components = $scope.getComponents(componentsArray);
            var code = originalCode;
            var serialName;
            var visorCode;
            if (components.sp) {
                serialName = components.sp;
                visorCode = generateSensorsCode(components, serialName, '');
                code = code.replace(/loop\(\){([^]*)}/, 'loop() {' + visorCode + '$1' + '}');
            } else {
                var serialCode = originalCode.split('/***   Included libraries  ***/');
                serialCode[1] = '\n\r#include <SoftwareSerial.h>\n\r#include <BitbloqSoftwareSerial.h>' + serialCode[1];
                code = '/***   Included libraries  ***/' + serialCode[0] + serialCode[1];
                code = code.split('\n/***   Setup  ***/');
                code = code[0].substring(0, code[0].length - 1) + 'bqSoftwareSerial puerto_serie_0(0, 1, 9600);' + '\n\r' + '\n/***   Setup  ***/' + code[1];
                visorCode = generateSensorsCode(components, 'puerto_serie_0', '');
                code = code.replace(/loop\(\){([^]*)}/, 'loop() {' + visorCode + '$1' + '}');
            }
            return code;
        };

        function generateSerialViewerBloqCode(componentsArray, originalCode) {
            var components = $scope.getComponents(componentsArray);
            var code = originalCode;
            var serialName;
            if (components.sp) {
                code = code.substring(0, code.length - 1) + '\n\r';
                serialName = components.sp;
                code = generateViewerBloqCode(components, serialName, code);
            } else {
                var serialCode = originalCode.split('/***   Included libraries  ***/');
                serialCode[1] = '\n\r#include <SoftwareSerial.h>\n\r#include <BitbloqSoftwareSerial.h>' + serialCode[1];
                code = '/***   Included libraries  ***/' + serialCode[0] + serialCode[1];
                code = code.split('\n/***   Setup  ***/');
                code = code[0].substring(0, code[0].length - 1) + 'bqSoftwareSerial puerto_serie_0(0, 1, 9600);' + '\n\r' + '\n/***   Setup  ***/' + code[1];
                code = generateViewerBloqCode(components, 'puerto_serie_0', code);
            }

            code = code + '}';
            return code;
        }

        function generateViewerBloqCode(componentsArray, serialName, code) {
            var sensorsCode = generateSensorsCode(componentsArray, serialName, '');
            code = code.replace('/*sendViewerData*/', sensorsCode);
            return code;
        }

        $scope.thereIsSerialBlock = function(code) {
            var serialBlock;
            if (code.indexOf('/*sendViewerData*/') > -1) {
                serialBlock = true;
            } else {
                serialBlock = false;
            }

            return serialBlock;
        };

        function generateSensorsCode(components, serialName, code) {
            _.forEach(components, function(value, key) {
                if (angular.isObject(value)) {
                    if (value.type === 'analog') {
                        _.forEach(value.names, function(name) {
                            code = code.concat(serialName + '.println(String("[' + key.toUpperCase() + ':' + name + ']:") + String(String(analogRead(' + name + '))));\n\r');
                            //  code = code + 'delay(500);\n\r';
                        });
                    } else {
                        _.forEach(value.names, function(name) {
                            if (key === 'us' || key === 'encoder') {
                                code = code.concat(serialName + '.println(String("[' + key.toUpperCase() + ':' + name + ']:") + String(String(' + name + '.read())));\n\r');
                                code = code + 'delay(50);\n\r';
                            } else if (key === 'hts221') {
                                code = code.concat(serialName + '.println(String("[' + key.toUpperCase() + '_temperature:' + name + ']:") + String(String(' + name + '.getTemperature())));\n\r');
                                code = code + 'delay(50);\n\r';
                                code = code.concat(serialName + '.println(String("[' + key.toUpperCase() + '_humidity:' + name + ']:") + String(String(' + name + '.getHumidity())));\n\r');
                                code = code + 'delay(50);\n\r';
                            } else {
                                code = code.concat(serialName + '.println(String("[' + key.toUpperCase() + ':' + name + ']:") + String(String(digitalRead(' + name + '))));\n\r');
                                //   code = code + 'delay(500);\n\r';
                            }
                        });
                    }
                }
            });

            return code;
        }

        $scope.verify = function() {
            if ($scope.common.useChromeExtension()) {
                web2boardOnline.compile({
                    board: exerciseService.getBoardMetaData(),
                    code: $scope.getPrettyCode()
                });
            } else {
                if (web2board.isWeb2boardV2()) {
                    verifyW2b2();
                } else {
                    verifyW2b1();
                }
            }

        };

        $scope.upload = function(code) {
            var viewer;
            viewer = !!code;
            if ($scope.currentProject.hardware.board) {
                if ($scope.currentProject.hardware.robot === 'mBot') {
                    if ($scope.common.os === 'ChromeOS') {
                        alertsService.add({
                            text: 'mbot-not-compatible-chromebook',
                            id: 'mbotChromebooks',
                            type: 'error',
                            time: 'infinite'
                        });
                    } else {
                        if ($scope.common.user && $scope.common.user.chromeapp) {
                            alertsService.add({
                                text: 'mbot-not-compatible-chromeextension',
                                id: 'mbotChromebooks',
                                type: 'error',
                                time: 'infinite',
                                linkText: 'click-here-load-with-web2board',
                                link: function() {
                                    alertsService.closeByTag('mbotChromebooks');
                                    uploadWithWeb2board();
                                }
                            });
                        } else {
                            uploadWithWeb2board();
                        }
                    }

                } else {
                    if ($scope.common.useChromeExtension()) {

                        if ($scope.thereIsSerialBlock($scope.getPrettyCode())) {
                            web2boardOnline.compileAndUpload({
                                board: exerciseService.getBoardMetaData(),
                                code: $scope.getPrettyCode(generateSerialViewerBloqCode($scope.currentProject.hardware.components, $scope.getPrettyCode())),
                                viewer: viewer
                            });
                        } else {
                            web2boardOnline.compileAndUpload({
                                board: exerciseService.getBoardMetaData(),
                                code: $scope.getPrettyCode(code),
                                viewer: viewer
                            });
                        }

                    } else {
                        uploadWithWeb2board();
                    }
                }
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'web2board',
                    type: 'warning'
                });
            }

        };

        function uploadWithWeb2board() {
            if (web2board.isWeb2boardV2()) {
                uploadW2b2();
            } else {
                uploadW2b1();
            }
        }

        $scope.serialMonitor = function() {
            if ($scope.currentProject.hardware.board) {
                if ($scope.common.useChromeExtension()) {
                    commonModals.launchSerialWindow(exerciseService.getBoardMetaData());
                } else {
                    if (web2board.isWeb2boardV2()) {
                        serialMonitorW2b2();
                    } else {
                        serialMonitorW2b1();
                    }
                }
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        };

        $scope.chartMonitor = function() {
            if ($scope.currentProject.hardware.board) {
                web2board.chartMonitor(exerciseService.getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        };

        $scope.showWeb2boardSettings = function() {
            web2board.showSettings();
        };

        $scope.showPlotter = function() {
            if ($scope.currentProject.hardware.board) {
                if ($scope.common.useChromeExtension()) {
                    commonModals.launchPlotterWindow(exerciseService.getBoardMetaData());
                } else {
                    if (web2board.isWeb2boardV2()) {
                        plotterW2b2();
                    } else {
                        plotterW2b1();
                    }
                }
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }

        };

        $scope.getCode = function() {
            $scope.updateBloqs();
            return exerciseService.getCode();
        };

        $scope.getPrettyCode = function() {
            var prettyCode;
            prettyCode = utils.prettyCode($scope.getCode());
            return prettyCode;
        };

        $scope.$on('$destroy', function() {
            $window.removeEventListener('bloqs:dragend', onBloqsDragEndHandler);
            $window.removeEventListener('bloqs:suggestedAdded', onBloqsSuggestedAddedHandler);
            $window.removeEventListener('bloqs:connect', onBloqsConnectHandler);
            $window.removeEventListener('bloqs:change', onBloqsChangeHandler);
        });

    });
