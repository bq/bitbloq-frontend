'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqsprojectCtrl
 * @description
 * # BloqsprojectCtrl
 * Controller of the bitbloqApp
 */

angular.module('bitbloqApp')
    .controller('BloqsprojectCtrl', function($rootScope, $route, $scope, $log, $timeout, $routeParams, $document, $window, $location,
        $q, web2board, alertsService, ngDialog, _, projectApi, bloqs, bloqsUtils, utils, userApi, commonModals, hw2Bloqs, web2boardOnline,
        projectService, hardwareConstants, chromeAppApi) {

        /*************************************************
         Project save / edit
         *************************************************/

        $scope.setCode = function(code) {
            $scope.code = code;
        };

        $scope.uploadFileProject = function(project) {
            $scope.hardware.firstLoad = true;
            if ($scope.hardware.cleanSchema) {
                $scope.hardware.cleanSchema();
            }
            _uploadProject(project);
        };

        $scope.twitterWheel = false;
        $scope.anyComponent = function(forceCheck) {
            if ($scope.currentTab === 0 && !forceCheck) { //software Toolbox not visible
                return false;
            }
            if (projectService.project.hardware.components.length === 0) {
                if (projectService.project.useBitbloqConnect) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        };
        $scope.anyAdvancedComponent = function() {
            return !_.isEqual(projectService.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };
        $scope.anySerialComponent = function() {
            return projectService.componentsArray.serialElements.length > 0;
        };

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

        function uploadW2b1(code) {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                var boardReference = projectService.getBoardMetaData();
                settingBoardAlert = alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });

                web2board.upload(boardReference, $scope.getPrettyCode(code));
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

        function uploadW2b2(code) {
            if (projectService.project.hardware.board) {
                web2board.upload(projectService.getBoardMetaData().mcu, $scope.getPrettyCode(code));
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
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                var boardReference = projectService.getBoardMetaData();
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
            if (projectService.project.hardware.board) {
                web2board.serialMonitor(projectService.getBoardMetaData());
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
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                //todo....
                var boardReference = projectService.getBoardMetaData();
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
            if (projectService.project.hardware.board) {
                web2board.plotter(projectService.getBoardMetaData());
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

            var bluetooth = _.find(componentsArray, function(o) {
                return o.id === 'bt';
            });

            var phoneElements = _.find(componentsArray, function(o) {
                return o.id === 'device';
            });
            if (serialPort) {
                components.sp = serialPort.name;
            }

            if (bluetooth) {
                components.bt = bluetooth.name;
            }

            if (phoneElements) {
                components.device = phoneElements.name;
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

        function generateMobileTwitterCode(componentsArray, originalCode) {
            var components = $scope.getComponents(projectService.project.hardware.components);
            var board = projectService.getBoardMetaData().id;

            var code = originalCode;
            var deviceName;
            //bqZUM

            if (board === 'bqZUM') {
                deviceName = projectService.project.bitbloqConnectBT.name;
            } else {
                deviceName = components.bt;
            }

            code = generateTwitterBloqCode(deviceName, code);
            return code;
        }

        function generateTwitterBloqCode(serialName, code) {
            var finalCode = code.replace('/*sendTwitterAppConfig*/', serialName + '.println(String("twitterConfig-")+String("' + $scope.common.user.twitterApp.consumerKey + '")+"/"+String("' + $scope.common.user.twitterApp.consumerSecret + '")+"/"+String("' + $scope.common.user.twitterApp.accessToken + '")+"/"+String("' + $scope.common.user.twitterApp.accessTokenSecret + '"));');
            return finalCode;
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

        $scope.thereIsTwitterBlock = function(code) {
            var twitterBlock;
            if (code.indexOf('/*sendTwitterAppConfig*/') > -1) {
                twitterBlock = true;
            } else {
                twitterBlock = false;
            }
            return twitterBlock;
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
                    board: projectService.getBoardMetaData(),
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
        var warningShown;

        $scope.upload = function(code) {
            var viewer;
            viewer = !!code;
            if (projectService.project.hardware.board) {
                if (projectService.project.hardware.robot === 'mBot') {
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

                    if (showCompileWarning(projectService.project) && !warningShown) {
                        alertsService.add({
                            text: 'connect_alert_01',
                            id: 'connect-error',
                            type: 'warning',
                        });
                        warningShown = true;
                    }
                    if ($scope.common.useChromeExtension()) {
                        if ($scope.thereIsSerialBlock($scope.getPrettyCode())) {
                            web2boardOnline.compileAndUpload({
                                board: projectService.getBoardMetaData(),
                                code: $scope.getPrettyCode(generateSerialViewerBloqCode(projectService.project.hardware.components, $scope.getPrettyCode())),
                                viewer: viewer
                            });
                        } else if ($scope.thereIsTwitterBlock($scope.getPrettyCode())) {
                            web2boardOnline.compileAndUpload({
                                board: projectService.getBoardMetaData(),
                                code: $scope.getPrettyCode(generateMobileTwitterCode(projectService.project.hardware.components, $scope.getPrettyCode())),
                                viewer: viewer
                            });

                        } else {
                            web2boardOnline.compileAndUpload({
                                board: projectService.getBoardMetaData(),
                                code: $scope.getPrettyCode(code),
                                viewer: viewer
                            });
                        }

                    } else {
                        if ($scope.thereIsSerialBlock($scope.getPrettyCode())) {
                            uploadWithWeb2board($scope.getPrettyCode(generateSerialViewerBloqCode(projectService.project.hardware.components, $scope.getPrettyCode())));
                        } else if ($scope.thereIsTwitterBlock($scope.getPrettyCode())) {
                            uploadWithWeb2board($scope.getPrettyCode(generateMobileTwitterCode(projectService.project.hardware.components, $scope.getPrettyCode())));
                        } else {
                            uploadWithWeb2board();
                        }

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

        function showCompileWarning(project) {
            var compileWarning;
            var result;
            _.forEach(project.hardware.components, function(component) {
                compileWarning = _.findKey(component.pin, function(o) {
                    return o === '1' || o === '0';
                });
            });

            if (compileWarning) {
                result = true;
            } else {
                result = false;
            }
            return result;
        }

        function uploadWithWeb2board(code) {
            if (web2board.isWeb2boardV2()) {
                uploadW2b2(code);
            } else {
                uploadW2b1(code);
            }
        }

        $scope.serialMonitor = function() {
            if (projectService.project.hardware.board) {
                if ($scope.common.useChromeExtension()) {
                    commonModals.launchSerialWindow(projectService.getBoardMetaData());
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
            if (projectService.project.hardware.board) {
                web2board.chartMonitor(projectService.getBoardMetaData());
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
            if (projectService.project.hardware.board) {
                if ($scope.common.useChromeExtension()) {
                    commonModals.launchPlotterWindow(projectService.getBoardMetaData());
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
            return projectService.getCode();
        };

        $scope.getPrettyCode = function(code) {
            var prettyCode;
            if (code) {
                prettyCode = utils.prettyCode(code);
            } else {
                prettyCode = utils.prettyCode($scope.getCode());
            }
            return prettyCode;
        };

        /* ****** */

        function _resetDropdown(element, list) {
            if (list[0]) {
                element.dataset.reference = list[0].uid;
                element.dataset.value = list[0].name;
                element.value = list[0].name;
            } else {
                delete element.dataset.reference;
                delete element.dataset.value;
            }
            element.selectedIndex = 0;
        }

        $scope.updateBloqs = function() {

            if (projectService.bloqs.varsBloq) {

                var allBloqs = bloqs.bloqs;
                var allComponents = [];

                //Why?
                for (var bloq in allBloqs) {
                    allBloqs[bloq].componentsArray = projectService.componentsArray;
                }

                var updateBloq = function(element, list) {

                    var componentRef = list.find(function(comp) {
                        return comp.uid === element.dataset.reference;
                    });

                    bloqsUtils.drawDropdownOptions($(element), list);

                    if (componentRef) {
                        element.value = componentRef.name;
                        element.dataset.reference = componentRef.uid;
                        element.dataset.value = componentRef.name;
                    } else {
                        $log.debug('dropdown not selected or reference was lost');
                        _resetDropdown(element, list);
                    }
                };
                var bloqCanvasEl = null;
                //Update dropdowns values from bloqs canvas
                for (var type in projectService.componentsArray) {
                    bloqCanvasEl = document.getElementsByClassName('bloqs-tab')[0];
                    var nodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="' + type + '"]');
                    for (var i = 0, len = nodeList.length; i < len; i++) {
                        updateBloq(nodeList[i], projectService.componentsArray[type]);
                    }
                    allComponents = allComponents.concat(projectService.componentsArray[type]);
                }
                //Update dropdowns from bloqs of toolbox
                if (bloqCanvasEl) {
                    var toolboxNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="varComponents"]');
                    for (var j = 0, len2 = toolboxNodeList.length; j < len2; j++) {
                        updateBloq(toolboxNodeList[j], allComponents);
                    }

                    var varServos = [];
                    varServos = varServos.concat(projectService.componentsArray.servos, projectService.componentsArray.oscillators, projectService.componentsArray.continuousServos);
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
        $scope.currentTab = 0;

        $scope.setTab = function(index) {
            if (!_.isEqual(projectService.project, projectService.getDefaultProject())) {
                projectService.startAutosave(true);
            }
            if (index === 0) {
                hw2Bloqs.repaint();
            } else if (index === 1) {
                if ($scope.toolbox.level !== 1) {
                    $scope.toolbox.level = 1;
                }
                $scope.setCode($scope.getCode());
                $rootScope.$emit('currenttab:bloqstab');
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

        $scope.publishProject = function(type) {
            type = type || '';
            projectService.checkPublish(type).then(function() {
                var projectDefault = projectService.getDefaultProject();
                projectService.completedProject();
                delete projectDefault.software.freeBloqs;
                if (_.isEqual(projectDefault.software, projectService.project.software)) {
                    alertsService.add({
                        text: 'publishProject__alert__bloqsProjectEmpty' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    $scope.publishProjectError = false;
                    if (type === 'Social') {
                        commonModals.shareSocialModal(projectService.project);
                    } else {
                        commonModals.publishModal(projectService.project);
                    }
                }
            }).catch(function() {
                $scope.publishProjectError = true;
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
                vars: projectService.bloqs.varsBloq.getBloqsStructure(),
                setup: projectService.bloqs.setupBloq.getBloqsStructure(),
                loop: projectService.bloqs.loopBloq.getBloqsStructure(),
                freeBloqs: freeBloqs
            };
            //showProjectResumeOnConsole(step);
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
                //showProjectResumeOnConsole(step);
                projectService.project.software = step;

                $rootScope.$emit('update-bloqs');
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
            }
        };

        $scope.redoBloqStep = function() {
            //$log.log('redo bloq', $scope.bloqsHistory.pointer, $scope.bloqsHistory.history.length);
            if ($scope.bloqsHistory.pointer < ($scope.bloqsHistory.history.length - 1)) {
                $scope.bloqsHistory.pointer++;

                var step = $scope.bloqsHistory.history[$scope.bloqsHistory.pointer];
                //showProjectResumeOnConsole(step);
                projectService.project.software = step;

                $rootScope.$emit('update-bloqs');
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
            }

        };

        $scope.hideTwitterWheel = function() {
            $scope.twitterWheel = false;
        };

        function showProjectResumeOnConsole(project) { // jshint ignore:line
            $log.log('Resume project');
            $log.log('*vars');
            if (project.vars.childs) {
                for (var i = 0; i < project.vars.childs.length; i++) {
                    $log.log('---', project.vars.childs[i].name);
                    if (project.vars.childs[i].childs) {
                        for (var j = 0; j < project.vars.childs[i].childs.length; j++) {
                            $log.log('------', project.vars.childs[i].childs[j].name);
                        }
                    }
                }
            }
        }

        function addProjectWatchersAndListener() {
            projectService.addWatchers();
            $scope.$watch('code', function(newVal, oldVal) {
                if (newVal !== oldVal && oldVal !== '') {
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                }
            });

            $window.addEventListener('bloqs:dragend', function(evt) {
                if (evt.detail.bloq.bloqData.name === 'phoneConfigTwitter') {
                    $scope.twitterWheel = true;
                }
                $scope.saveBloqStep();
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
                $scope.$apply();
            });

            $window.addEventListener('bloqs:suggestedAdded', function() {
                $scope.saveBloqStep();
                $scope.hardware.firstLoad = false;
                $scope.$apply();
            });

            $window.addEventListener('bloqs:connect', function() {
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
                $scope.$apply();
            });

            $window.addEventListener('bloqs:change', function() {
                if (projectService.bloqs.loopBloq) {
                    $scope.saveBloqStep();
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                    $scope.$apply();
                }

            });
        }

        function launchModalTour() {
            ngDialog.closeAll();
            var modalTour = $rootScope.$new(),
                modalTourInit;
            _.extend(modalTour, {
                title: 'modal-tour-text-first',
                contentTemplate: '/views/modals/infoTour.html',
                customClass: 'modal--information',
                confirmAction: $scope.handleTour,
                rejectAction: $scope.tourDone
            });
            modalTourInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--tour',
                scope: modalTour,
                showClose: false,
                closeByDocument: false
            });
        }

        function launchModalAlert() {
            var modalTourStep = $rootScope.$new();
            _.extend(modalTourStep, {
                contentTemplate: '/views/modals/alert.html',
                text: 'modal-tour-step',
                confirmText: 'modal__understood-button',
                confirmAction: showStepFive
            });
            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalTourStep,
                showClose: false
            });

        }

        function showStepFive() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = 5;
        }

        function launchModalGuest() {
            var modalGuest = $rootScope.$new(),
                modalGuestInit;
            _.extend(modalGuest, {
                contentTemplate: '/views/modals/alert.html',
                confirmAction: function() {
                    ngDialog.closeAll();
                    $scope.common.goToLogin();
                },
                cancelButton: true,
                text: 'modal-not-registered-text',
                cancelText: 'continue-as-guest',
                confirmText: 'enter-or-register',
                rejectAction: launchModalTour
            });

            modalGuestInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalGuest,
                showClose: false,
                closeByDocument: false
            });
        }

        function checkBackspaceKey(event) {
            if (event.which === 8 &&
                event.target.nodeName !== 'INPUT' &&
                event.target.nodeName !== 'SELECT' &&
                event.target.nodeName !== 'TEXTAREA' && !$document[0].activeElement.attributes['data-bloq-id']) {

                event.preventDefault();
            }
        }

        /*****************************
         *   Toolbox
         *****************************/

        $scope.handleTour = function(step) {
            step = step || 1;
            switch (step) {
                case 1:
                    if (!$scope.tourCurrentStep) {
                        $scope.tourCurrentStep = 1;
                    }
                    break;
                case 2:
                    if ($scope.tourCurrentStep === 1) {

                        $scope.tourCurrentStep = 2;
                        var runStepThree = $scope.$on('menu--open', function() {
                            $timeout(function() {
                                $('.toolbox__content').animate({
                                    scrollTop: $('[dragid="led"]').offset().top - 150
                                }, 'slow');
                                $scope.handleTour(3);
                                runStepThree();
                            }, 0);
                        });
                    }
                    break;
                case 3:
                    if ($scope.tourCurrentStep === 2) {
                        $scope.tourCurrentStep = 3;
                        var runStepFour = $rootScope.$on('component-connected', function() {
                            $scope.handleTour(4);
                            runStepFour();
                        });
                    }
                    break;
                case 4:
                    if ($scope.tourCurrentStep === 3) {
                        $scope.tourCurrentStep = 4;
                    }
                    break;
                case 5:
                    if ($scope.tourCurrentStep === 4) {
                        launchModalAlert();
                    }
                    break;
                case 6:
                    if ($scope.tourCurrentStep === 5) {
                        $scope.tourCurrentStep = 6;
                        var runStepSeven = $window.addEventListener('bloqs:connect', function() {
                            $scope.handleTour(7);
                            runStepSeven();
                        });
                    }
                    break;
                case 7:
                    if ($scope.tourCurrentStep === 6) {
                        $scope.$apply(function() {
                            $scope.tourCurrentStep = 7;
                        });
                        var endTour = $scope.$on('uploading', function() {
                            $scope.tourDone();
                            endTour();
                        });
                    }
                    break;
                default:
                    throw 'not a tour step';
            }
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        $scope.tourDone = function() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = null;
            if ($scope.common.user) {
                $scope.common.user.takeTour = true;
                userApi.update({
                    takeTour: true
                });
            }
        };
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
         Project settings
         *************************************************/

        var compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.code = '';

        $scope.hardware = {
            componentList: null,
            robotList: null,
            cleanSchema: null,
            sortToolbox: null,
            firstLoad: true
        };

        $scope.projectApi = projectApi;
        $scope.currentProject = projectService.project;
        $scope.currentProjectService = projectService;

        projectService.saveStatus = 0;

        projectService.initBloqsProject();
        $scope.currentProjectLoaded = $q.defer();

        if (!$scope.common.user) {
            $scope.common.session.save = false;
        }

        /*************************************************
         Load project
         *************************************************/
        $scope.common.isLoading = true;
        $scope.hwBasicsLoaded = $q.defer();

        $scope.initHardwarePromise = function() {
            $scope.hwBasicsLoaded = $q.defer();
        };

        $scope.common.itsUserLoaded().then(function() {
            $log.debug('There is a registed user');
            if ($routeParams.id) {
                loadProject($routeParams.id).finally(function() {
                    checkIfTwitterBloq(projectService.project);
                    addProjectWatchersAndListener();
                });
            } else {
                if ($scope.common.session.save) {
                    $scope.common.session.save = false;
                    projectService.setProject($scope.common.session.project);
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                }
                if (!$scope.common.user.takeTour) {
                    launchModalTour();
                }
                addProjectWatchersAndListener();
                $scope.hwBasicsLoaded.promise.then(function() {
                    $scope.$emit('drawHardware');
                });
                $scope.currentProjectLoaded.resolve();
            }
        }, function() {
            $log.debug('no registed user');
            if ($routeParams.id) {
                loadProject($routeParams.id).finally(function() {
                    addProjectWatchersAndListener();
                });
            } else {
                addProjectWatchersAndListener();
                launchModalGuest();
            }
        });

        function checkIfTwitterBloq(projectData) {
            projectData.software.loop.childs.forEach(function(element) {
                if (element.name === 'phoneConfigTwitter') {
                    $scope.twitterWheel = true;
                }
            });
            projectData.software.setup.childs.forEach(function(element) {
                if (element.name === 'phoneConfigTwitter') {
                    $scope.twitterWheel = true;
                }
            });
            projectData.software.vars.childs.forEach(function(element) {
                if (element.name === 'phoneConfigTwitter') {
                    $scope.twitterWheel = true;
                }
            });
        }

        function loadProject(id) {
            return projectApi.get(id).then(function(response) {
                _uploadProject(response.data);
                $scope.currentProjectLoaded.resolve();
            }, function(error) {
                projectService.addWatchers();
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
                        $location.path('/bloqsproject/');
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

        function _uploadProject(project) {
            if (project.codeProject) {
                $location.path('/codeproject/' + project._id);
            } else {
                //set freebloqs object
                if (project.software) {
                    project.software.freeBloqs = project.software.freeBloqs || [];
                }

                projectService.setProject(project, project.codeProject, true);
                $scope.saveBloqStep(_.clone(project.software));
                projectService.saveOldProject();
                $scope.hwBasicsLoaded.promise.then(function() {
                    $scope.$emit('drawHardware');
                });
                $scope.$broadcast('refresh-bloqs');
            }
        }

        function confirmExit() {
            var closeMessage;
            chromeAppApi.stopSerialCommunication();
            $scope.$apply();

            if (projectService.saveStatus === 1) {
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

    });