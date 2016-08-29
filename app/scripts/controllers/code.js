'use strict';
/* global js_beautify */

/**
 * @ngdoc function
 * @name bitbloqApp.controller:CodeCtrl
 * @description
 * # CodeCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('CodeCtrl', function($scope, $q, projectApi, imageApi, resource, $routeParams, _, alertsService, envData,
        $timeout, utils, $location, web2board, $window, $rootScope, commonModals, $route, chromeAppApi,
        common, compilerApi, hardwareConstants) {

        $window.onbeforeunload = confirmExit;

        $scope.$on('$destroy', function() {
            $window.onbeforeunload = null;
        });

        function confirmExit() {
            var closeMessage;
            if (projectApi.saveStatus === 1) {
                closeMessage = $scope.common.translate('leave-without-save');
            }
            return closeMessage;
        }

        function getBoardMetaData() {
            return _.find($scope.boards, function(item) {
                return item.name === $scope.project.hardware.board;
            });
        }

        function uploadW2b1() {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.project.hardware.board) {
                web2board.setInProcess(true);
                var boardMetadata = _.find($scope.boards, function(item) {
                    return item.name === $scope.project.hardware.board;
                });
                settingBoardAlert = alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });
                web2board.setInProcess(true);

                web2board.upload(boardMetadata, utils.prettyCode($scope.project.code));
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function uploadW2b2() {
            if ($scope.project.hardware.board) {
                web2board.upload(getBoardMetaData().mcu, utils.prettyCode($scope.project.code));
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

            web2board.verify(utils.prettyCode($scope.project.code));
        }

        function verifyW2b2() {
            web2board.verify(utils.prettyCode($scope.project.code));
        }

        function serialMonitorW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.project.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                var boardMetadata = _.find($scope.boards, function(item) {
                    return item.name === $scope.project.hardware.board;
                });
                web2board.serialMonitor(boardMetadata);
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        }

        function serialMonitorW2b2() {
            if ($scope.project.hardware.board) {
                web2board.serialMonitor(getBoardMetaData());
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

        $scope.isWeb2BoardInProgress = web2board.isInProcess;

        $scope.getSavingStatusIdLabel = projectApi.getSavingStatusIdLabel;

        $scope.toggleCollapseHeader = function() {
            $scope.collapsedHeader = !$scope.collapsedHeader;
        };

        $scope.startAutosave = function() {
            projectApi.startAutosave(_saveProject);
        };

        $scope.verify = function() {
            //if (common.os === 'ChromeOS') {
            if (true) {
                var board = getBoardMetaData();
                if (!board) {
                    board = 'bt328';
                } else {
                    board = board.mcu;
                }
                compilerApi.compile({
                    board: board,
                    code: utils.prettyCode($scope.project.code)
                }).then(function(response) {
                    console.log('response');
                    console.log(response);
                    if (response.data.error) {
                        alertsService.add({
                            id: 'web2board',
                            type: 'warning',
                            translatedText: utils.parseCompileError(response.data.error)
                        });
                    } else {
                        alertsService.add({
                            text: 'alert-web2board-compile-verified',
                            id: 'web2board',
                            type: 'ok',
                            time: 5000
                        });
                    }
                });
            } else {
                if (web2board.isWeb2boardV2()) {
                    verifyW2b2();
                } else {
                    verifyW2b1();
                }
            }
        };

        $scope.upload = function() {
            if (true) {
                //if (common.os === 'ChromeOS') {
                chromeAppApi.isConnected().then(function() {
                    var board = getBoardMetaData();
                    if (!board) {
                        board = 'bt328';
                    } else {
                        board = board.mcu;
                    }
                    compilerApi.compile({
                        board: board,
                        code: utils.prettyCode($scope.project.code)
                    }).then(function(response) {
                        if (response.data.error) {
                            alertsService.add({
                                id: 'web2board',
                                type: 'warning',
                                translatedText: utils.parseCompileError(response.data.error)
                            });
                        } else {
                            chromeAppApi.sendHex({
                                board: board,
                                file: response.data.hex
                            });
                        }
                    });
                }).catch(function() {
                    alertsService.add({
                        text: 'instala chrome app',
                        id: 'chromeapp-install',
                        type: 'warning',
                        linkText: 'aqui',
                        link: installChromeApp
                    });

                });
            } else {
                if (web2board.isWeb2boardV2()) {
                    uploadW2b2();
                } else {
                    uploadW2b1();
                }
            }
        };

        function installChromeApp() {
            chrome.webstore.install('https://chrome.google.com/webstore/detail/' + envData.config.chromeAppId, function(response) {
                console.log('response', response);
                $scope.upload();
            }, function(error) {
                console.log('install error');
                console.log('error', error);
            });
        }

        $scope.getCurrentProject = function() {
            return _.cloneDeep($scope.project);
        };

        $scope.onFieldKeyUp = function(event) {
            if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === 's') { //Ctrl + S
                return true;
            }
        };

        $scope.setProject = function(project) {
            $scope.project = project;
            $scope.setBoard($scope.project.board);
            _prettyCode();
        };

        $scope.setBoard = function(boardName) {
            if (!$scope.project.hardwareTags) {
                $scope.project.hardwareTags = [];
            }
            var indexTag = $scope.project.hardwareTags.indexOf($scope.project.hardware.board);
            if (indexTag !== -1) {
                $scope.project.hardwareTags.splice(indexTag, 1);
            }
            $scope.project.hardware.board = boardName || 'bq ZUM'; //Default board is ZUM
            var boardMetadata = _.find($scope.boards, function(board) {
                return board.name === $scope.project.hardware.board;
            });
            $scope.boardImage = boardMetadata && boardMetadata.id;
            $scope.project.hardwareTags.push($scope.project.hardware.board);
        };

        $scope.serialMonitor = function() {
            if (web2board.isWeb2boardV2()) {
                serialMonitorW2b2();
            } else {
                serialMonitorW2b1();
            }
        };

        $scope.showWeb2boardSettings = function() {
            web2board.showSettings();
        };

        $scope.publishProject = function(type) {
            type = type || '';
            var projectEmptyName = $scope.common.translate('new-project');
            if (!$scope.project.name || $scope.project.name === projectEmptyName) {
                if (!$scope.project.description) {
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
                $scope.project.name = $scope.project.name === projectEmptyName ? '' : $scope.project.name;
                $scope.publishProjectError = true;
                $scope.currentTab = 'info';
            } else if (!$scope.project.description) {
                alertsService.add({
                    text: 'publishProject__alert__descriptionError' + type,
                    id: 'publishing-project',
                    type: 'warning'
                });
                $scope.publishProjectError = true;
                $scope.currentTab = 'info';
            } else {
                $scope.publishProjectError = false;
                if (type === 'Social') {
                    commonModals.shareSocialModal($scope.project);
                } else {
                    commonModals.publishModal($scope.project);
                }
            }
        };

        function _saveProject() {
            var defered = $q.defer();

            $scope.project.name = $scope.project.name || $scope.common.translate('new-project');

            if ($scope.tempImage.file && !$scope.tempImage.generate) {
                $scope.project.image = 'custom';
            }

            if ($scope.project._id) {
                if (!$scope.project._acl || ($scope.project._acl['user:' + $scope.common.user._id] && $scope.project._acl['user:' + $scope.common.user._id].permission === 'ADMIN')) {
                    if ($scope.tempImage.file && !$scope.tempImage.generate) {
                        $scope.project.image = 'custom';
                    }
                    return projectApi.update($scope.project._id, $scope.project).then(function() {

                        localStorage.projectsChange = true;

                        if ($scope.tempImage.blob) {
                            imageApi.save($scope.project._id, $scope.tempImage.blob).then(function() {
                                $scope.imageForceReset = !$scope.imageForceReset;
                                $scope.tempImage = {};
                            });
                        }
                    });
                } else {
                    projectApi.saveStatus = 4;
                }
            } else {
                if ($scope.common.user) {
                    $scope.project.creator = $scope.common.user._id;
                    if ($scope.tempImage.file && !$scope.tempImage.generate) {
                        $scope.project.image = 'custom';
                    }
                    return projectApi.save($scope.project).then(function(response) {
                        var idProject = response.data;
                        $scope.project._id = idProject;
                        projectApi.get(idProject).success(function(response) {
                            $scope.project._acl = response._acl;
                        });
                        //to avoid reload
                        $route.current.pathParams.id = idProject;
                        $location.url('/codeproject/' + idProject);
                        $scope.common.isLoading = false;
                        localStorage.projectsChange = !localStorage.projectsChange;
                        if ($scope.tempImage.blob) {
                            imageApi.save(idProject, $scope.tempImage.blob).then(function() {
                                $scope.imageForceReset = !$scope.imageForceReset;
                                $scope.tempImage = {};
                            });
                        }

                    });
                } else {
                    projectApi.saveStatus = 0;
                    defered.reject();
                }
            }

            return defered.promise;
        }

        function _addWatchersAndListenerGuest() {
            if (!$scope.common.session.save) {

                $scope.$watch('project.code', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.common.session.save = true;
                    }
                });

                $scope.$watch('project.hardware.board', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.common.session.save = true;
                    }
                });
            }
        }

        function _addWatchersAndListener() {

            $scope.$watch('project.name', function(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.code', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.videoUrl', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.videoId = utils.isYoutubeURL(newVal);
                    if (!$scope.videoId && newVal) {
                        alertsService.add({
                            text: 'validate-videourl',
                            id: 'save-project',
                            type: 'warning'
                        });
                    } else {
                        $scope.startAutosave();
                    }
                }
            });

            $scope.$watch('project.description', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.hardware.board', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });
        }

        function _goToBloqs() {
            alertsService.close(editInfo);
            $location.url('/bloqsproject/' + $scope.project._id);
        }

        function _prettyCode() {
            var currentCursor = editorRef.getCursorPosition(),
                defered = $q.defer(),
                tmpCode = '';

            // Options
            editorRef.$blockScrolling = Infinity;
            editorRef.setAutoScrollEditorIntoView(true);

            //Prepare string to js_beautify
            function insertBeautyIgnores(match) {
                return '/* beautify ignore:start */' + match + '/* beautify ignore:end */';
            }

            //Remove beautify ignore & preserve sections
            tmpCode = js_beautify($scope.project.code.replace(/(#include *.*)/gm, insertBeautyIgnores).replace(/(#define *.*)/gm, insertBeautyIgnores)).replace(/(\/\* (beautify)+ .*? \*\/)/gm, ''); // jshint ignore:line

            $timeout(function() {

                $scope.project.code = tmpCode;
                $timeout(function() {
                    editorRef.moveCursorTo(currentCursor.row, currentCursor.column, true);
                });
                defered.resolve();
            });

            return defered.promise;
        }

        function _loadProject() {

            if ($routeParams.id) {
                projectApi.get($routeParams.id).then(function(response) {
                    $scope.project = response.data;
                    if ($scope.common.user && $scope.project._acl['user:' + $scope.common.user._id] && $scope.project._acl['user:' + $scope.common.user._id].permission === 'READ') {
                        $scope.disablePublish = true;
                    }
                    if (!response.data.codeProject) {
                        editInfo = alertsService.add({
                            text: 'code-project_alert_edit-code',
                            id: 'edit-project',
                            type: 'warning',
                            time: 7000,
                            linkText: 'undo',
                            link: _goToBloqs
                        });
                    }
                    if (!$scope.project.codeProject) {
                        $scope.project.hardwareTags = [];
                    }
                    $scope.project.codeProject = true;

                    $scope.setBoard($scope.project.hardware.board);

                    _prettyCode().then(function() {
                        $scope.common.itsUserLoaded().then(function() {
                            _addWatchersAndListener();
                        }).catch(function() {
                            _addWatchersAndListenerGuest();
                        });
                    });

                }, function(response) {
                    switch (response.status) {
                        case 404: //not_found
                            alertsService.add({
                                text: 'no-project',
                                id: 'load-project',
                                type: 'warning'
                            });
                            break;
                        case 401: //unauthorized
                            $route.current.pathParams.id = '';
                            $location.url('/codeproject/');
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
            } else {

                if ($scope.common.session.bloqTab) {
                    editInfo = alertsService.add({
                        text: 'code-project_alert_edit-code',
                        id: 'edit-project',
                        type: 'warning'
                    });
                }

                $scope.common.itsUserLoaded().then(function() {
                    if ($scope.common.session.save) {
                        $scope.project = $scope.common.session.project;
                        $scope.common.session.save = false;
                        $scope.startAutosave();
                    }
                    $scope.setBoard($scope.project.hardware.board);
                    _prettyCode().then(function() {
                        _addWatchersAndListener();
                    });
                }).catch(function() {
                    //$scope.setBoard($scope.common.session.project.hardware.board);
                    if ($scope.common.session.project.code) {
                        $scope.project = $scope.common.session.project;
                        _prettyCode().then(function() {
                            _addWatchersAndListenerGuest();
                        });
                    }
                    if ($scope.common.session.project.hardware.board) {
                        $scope.setBoard($scope.common.session.project.hardware.board);
                        _prettyCode().then(function() {
                            _addWatchersAndListenerGuest();
                        });
                    } else {
                        $scope.setBoard();
                        _addWatchersAndListenerGuest();
                    }
                });
            }
        }

        var editInfo, editorRef,
            compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.utils = utils;
        $scope.projectApi = projectApi;
        $scope.tempImage = {};

        $scope.project = {
            creator: '',
            name: $scope.common.translate('new-project'),
            description: '',
            userTags: [],
            hardwareTags: [],
            hardware: {
                board: 'bq ZUM'
            },
            imageType: '',
            videoUrl: '',
            code: '/***   Included libraries  ***/\n\n\n/***   Global variables and function definition  ***/\n\n\n/***   Setup  ***/\n\nvoid setup(){\n\n}\n\n/***   Loop  ***/\n\nvoid loop(){\n\n}',
            codeProject: true
        };

        $scope.boards = [];
        $scope.boardNameList = [];
        $scope.commonModals = commonModals;
        $scope.common.isLoading = true;

        $scope.boards = hardwareConstants.boards;
        $scope.boardNameList = _.pluck($scope.boards, 'name');

        // The ui-ace option
        $scope.aceOptions = {
            mode: 'c_cpp',
            useWrapMode: false,
            showGutter: true,
            theme: 'chrome',
            advanced: {
                enableSnippets: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            },
            rendererOptions: {
                fontSize: 14,
                minLines: 11
            },
            onLoad: function(_editor) {
                editorRef = _editor;
                _loadProject();
                editorRef.on('paste', function() {
                    setTimeout(function() {
                        _prettyCode();
                    }, 10);
                });
            }
        };

        $scope.$watch('common.session.save', function(newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                $scope.common.session.project = $scope.project;
            }
        });

        /*************************************************
         web2board communication
         *************************************************/

        $rootScope.$on('web2board:disconnected', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:wrong-version', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:no-web2board', function() {
            alertsService.close(compilingAlert);
            alertsService.close(settingBoardAlert);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-error', function(event, error) {
            error = JSON.parse(error);
            alertsService.add({
                text: 'alert-web2board-compile-error',
                id: 'compile',
                type: 'warning'
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-verified', function() {
            alertsService.add({
                text: 'alert-web2board-compile-verified',
                id: 'compile',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:boardReady', function(evt, data) {
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

        $rootScope.$on('web2board: boardNotReady', function() {
            alertsService.add({
                text: 'alert-web2board-boardNotReady',
                id: 'upload',
                type: 'warning'
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:uploading', function(evt, port) {
            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'upload',
                type: 'loading',
                value: port
            });
            web2board.setInProcess(true);
        });

        $rootScope.$on('web2board:code-uploaded', function() {
            alertsService.add({
                text: 'alert-web2board-code-uploaded',
                id: 'upload',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:upload-error', function(evt, data) {
            data = JSON.parse(data);
            if (!data.error) {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning'
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

        $rootScope.$on('web2board:no-port-found', function() {
            $scope.currentTab = 'info';
            web2board.setInProcess(false);
            alertsService.close(serialMonitorAlert);
            alertsService.add({
                text: 'alert-web2board-no-port-found',
                id: 'upload',
                type: 'warning'
            });
        });

        $rootScope.$on('web2board:serial-monitor-opened', function() {
            alertsService.close(serialMonitorAlert);
            web2board.setInProcess(false);
        });
    });