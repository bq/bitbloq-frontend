'use strict';
/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .factory('web2boardV2', function($rootScope, $websocket, $log, $q, ngDialog, _, $timeout, common, envData,
        alertsService, WSHubsAPI, OpenWindow, $compile, $translate, $location,
        commonModals) {

        /** Variables */

        var web2board = this,
            modalObj,
            api,
            inProgress = false,
            TIME_FOR_WEB2BOARD_TO_START = 1500, //ms
            TIMES_TRY_TO_START_W2B = 7,
            w2bToast = null,
            web2boarTimeOutResponse = 45000, //45 seconds
            serialMonitorPanel = null;

        web2board.config = {
            wsHost: '127.0.0.1',
            wsPort: 9876,
            serialPort: ''
        };

        /*Private functions*/
        function connect() {
            return api.connect('ws://' + web2board.config.wsHost + ':' + web2board.config.wsPort + '/bitbloq');
        }

        function isWeb2boardUpToDate(version) {
            // todo: this has to be improved
            return parseInt(version.replace(/\./g, ''), 10) >= parseInt(common.properties.web2boardVersion.replace(/\./g, ''), 10);
        }

        function isWSNotConnected(wsClient) {
            return !wsClient || (wsClient.readyState !== WebSocket.CONNECTING && wsClient.readyState !== WebSocket.OPEN);
        }

        function removeInProgressFlag() {
            inProgress = false;
        }

        function showWeb2BoardModal(options) {
            if (modalObj) {
                modalObj.close();
            }
            var parent = $rootScope,
                modalOptions = parent.$new(),
                viewAllLink = function() {
                    modalObj.close();
                    $location.path('/downloads');
                };
            _.extend(modalOptions, options);

            _.extend(modalOptions, {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalButtons: true,
                modalText: 'modal-download-web2board-text',
                os: common.os,
                viewAllLink: viewAllLink
            });

            modalOptions.envData = envData;
            modalObj = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--download-web2board',
                scope: modalOptions,
                showClose: true
            });
        }

        function showWeb2BoardDownloadModal() {
            var modalOptions = {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalTitle: 'modal-download-web2board-title',
                footerText: 'web2board-alreadyInstalled',
                footerLink: showWeb2BoardErrorModal
            };
            return showWeb2BoardModal(modalOptions);
        }

        function showWeb2BoardUploadModal() {
            var modalOptions = {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalTitle: 'modal-update-web2board-title',
                modalText: 'modal-download-web2board-text'
            };
            return showWeb2BoardModal(modalOptions);
        }

        function showWeb2BoardErrorModal() {
            modalObj.close();
            var parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                contentTemplate: '/views/modals/web2boardErrors.html',
                backAction: showWeb2BoardDownloadModal,
                sendCommentsModal: function() {
                    modalObj.close();
                    commonModals.sendCommentsModal();
                }
            });

            modalOptions.envData = envData;

            modalObj = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--web2board-errors',
                scope: modalOptions,
                showClose: true
            });
        }

        function startWeb2board() {
            console.log('starting Web2board...');
            var tempA = document.createElement('a');
            tempA.setAttribute('href', 'web2board://');
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);
        }

        function onOpenConnectionTrigger(callback) {
            return api.VersionsHandlerHub.server.getVersion()
                .then(function(version) {
                    if (!isWeb2boardUpToDate(version)) {
                        removeInProgressFlag();
                        alertsService.add({
                            text: 'alert-web2board-exitsNewVersion',
                            id: 'web2board',
                            type: 'warning',
                            time: 5000,
                            linkText: 'download',
                            link: showWeb2BoardUploadModal
                        });
                    } else {
                        var libVersion = common.properties.bitbloqLibsVersion || '0.0.1';
                        var librariesAlert = alertsService.add({
                            text: 'alert-web2board-updatingLibraries',
                            id: 'web2board',
                            type: 'loading'
                        });
                        return api.VersionsHandlerHub.server.setLibVersion(libVersion)
                            .then(function() {
                                callback();
                            }, function(error) {
                                alertsService.add({
                                    text: 'alert-web2board-updatingLibraries-error',
                                    id: 'web2board',
                                    type: 'warning'
                                });
                                removeInProgressFlag();
                                $log.error('Unable to update libraries due to: ' + JSON.stringify(error));
                            }).finally(function() {
                                alertsService.close(librariesAlert);
                            });
                    }
                }, function(error) {
                    $log.error('unable to get version due to : ' + error);
                });
        }

        function openCommunication(callback, showUpdateModalFlag, tryCount) {
            tryCount = tryCount || 0;
            tryCount++;

            showUpdateModalFlag = showUpdateModalFlag === true && tryCount >= TIMES_TRY_TO_START_W2B;
            //noinspection JSUnresolvedFunction
            callback = callback || new Promise();
            if (isWSNotConnected(api.wsClient)) {
                if (tryCount === 1) {
                    w2bToast = alertsService.add({
                        text: 'web2board_toast_startApp',
                        id: 'web2board',
                        type: 'loading'
                    });
                }
                connect().then(
                    function() { //on success
                        api.wsClient.couldSuccessfullyConnect = true;
                        alertsService.close(w2bToast);
                        onOpenConnectionTrigger(callback);
                    },
                    function() { //on error
                        if (showUpdateModalFlag) {
                            inProgress = false;
                            alertsService.close(w2bToast);
                            showWeb2BoardDownloadModal();
                        } else {
                            if (tryCount === 1) {
                                // we only need to start web2board once
                                startWeb2board();
                            }
                            $timeout(function() {
                                openCommunication(callback, true, tryCount);
                            }, TIME_FOR_WEB2BOARD_TO_START);
                        }
                    }
                );
            } else {
                return callback();
            }
        }

        function handleCompileError(error) {
            var errorStr = error,
                alertParams = {
                    id: 'web2board',
                    type: 'warning'
                };
            if (typeof(error) === 'object') {
                var errorLines = [];
                error.forEach(function(errorLine) {
                    errorLines.push($translate.instant('alert-web2board-compile-line-error ', errorLine));
                });
                errorStr = errorLines.join('<br>');

                alertParams.translatedText = $translate.instant('alert-web2board-compile-error', {
                    value: '<br>' + errorStr
                });
            } else {
                alertParams.text = 'alert-web2board-compile-error';
                alertParams.value = error;
            }

            alertsService.add(alertParams);
        }

        function handleUploadError(error) {
            if (!error.title) {
                handleCompileError(error);
            } else if (error.title === 'BOARD_NOT_READY') {
                alertsService.add({
                    text: 'alert-web2board-no-port-found',
                    id: 'web2board',
                    type: 'warning'
                });
            } else {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'web2board',
                    type: 'warning',
                    value: error
                });
            }
            console.error(error);
        }

        function webSocketWrapper(url) {
            var ws = $websocket(url);
            ws.onMessage(function(ev) {
                ws.onmessage(ev);
            });
            ws.onOpen(function(ev) {
                ws.onopen(ev);
            });
            ws.onClose(function(ev) {
                ws.onclose(ev);
            });
            return ws;
        }

        function openSerialWindow(url, title, board) {
            if (!inProgress) {
                if (!board) {
                    alertsService.add({
                        text: 'alert-web2board-boardNotReady',
                        id: 'web2board',
                        type: 'warning'
                    });
                    return;
                }

                var windowArguments = {
                    url: url,
                    title: title
                };
                openCommunication(function() {
                    OpenWindow.open(windowArguments, function() {
                        window.setTimeout(function() {
                            api.SerialMonitorHub.server.closeAllConnections();
                            api.SerialMonitorHub.server.unsubscribeFromHub();
                        }, 100);
                    });
                });
            }
        }

        function updateSuccessfullyFinished(port) {
            alertsService.add({
                text: 'alert-web2board-code-uploaded',
                id: 'web2board',
                type: 'ok',
                time: 5000,
                value: port
            });
            if (serialMonitorPanel) {
                serialMonitorPanel.scope.uploadFinished();
            }
        }

        /* Set up api*/

        api = WSHubsAPI.construct(web2boarTimeOutResponse, webSocketWrapper, $q);

        api.defaultErrorHandler = function(error) {
            $log.error('Error receiving message: ' + error);
        };

        api.onClose = function(error) {
            $log.error('web2board disconnected with error: ' + error.reason);
            api.clearTriggers();
            inProgress = false;
            if (api.wsClient.couldSuccessfullyConnect) {
                alertsService.add({
                    text: 'web2board_toast_closedUnexpectedly',
                    id: 'web2board',
                    type: 'warning'
                });
            }
        };

        api.onMessageError = function(error) {
            $log.error('Error receiving message: ' + error);
            api.wsClient.close();
        };

        api.CodeHub.client.isCompiling = function() {
            alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'web2board',
                type: 'loading'
            });
        };

        api.CodeHub.client.isUploading = function(port) {
            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'web2board',
                type: 'loading',
                value: port
            });
        };

        api.CodeHub.client.isSettingPort = function(port) {
            $log.debug('is setting port in: ' + port);
            web2board.serialPort = port;
        };

        /*Public functions */

        web2board.verify = function(code) {
            //It is not mandatory to have a board connected to verify the code
            if (!inProgress) {
                inProgress = true;
                openCommunication(function() {
                    return api.CodeHub.server.compile(code).then(function() {
                        alertsService.add({
                            text: 'alert-web2board-compile-verified',
                            id: 'web2board',
                            type: 'ok',
                            time: 5000
                        });
                    }, function(error) {
                        handleCompileError(error);
                    }).finally(removeInProgressFlag);
                });
            }
        };

        web2board.upload = function(boardMcu, code) {
            if (!inProgress) {
                if (!code || !boardMcu) {
                    alertsService.add({
                        text: 'alert-web2board-boardNotReady',
                        id: 'web2board',
                        type: 'warning'
                    });
                    return;
                }
                inProgress = true;
                openCommunication(function() {
                    alertsService.add({
                        text: 'alert-web2board-settingBoard',
                        id: 'web2board',
                        type: 'loading'
                    });
                    return api.CodeHub.server.upload(code, boardMcu)
                        .then(updateSuccessfullyFinished, handleUploadError)
                        .finally(removeInProgressFlag);
                });
            }
        };

        function generateSerialWindow(port) {
            var scope = $rootScope.$new();
            scope.setOnUploadFinished = function(callback) {
                scope.uploadFinished = callback;
            };
            serialMonitorPanel = $.jsPanel({
                position: 'center',
                size: {
                    width: 500,
                    height: 500
                },
                onclosed: function() {
                    scope.$destroy();
                    serialMonitorPanel = null;
                },
                title: $translate.instant('serial'),
                ajax: {
                    url: 'views/serialMonitor.html',
                    done: function() {
                        if (port) {
                            scope.port = port;
                        }
                        this.html($compile(this.html())(scope));
                    }
                }
            });
            serialMonitorPanel.scope = scope;
        }

        web2board.serialMonitor = function(board) {
            if (serialMonitorPanel) {
                serialMonitorPanel.normalize();
                serialMonitorPanel.reposition('center');
                return;
            }
            if (common.os === 'Linux') {
                generateSerialWindow();
            } else {
                openCommunication(function() {
                    inProgress = true;
                    var toast = alertsService.add({
                        text: 'alert-web2board-openSerialMonitor',
                        id: 'web2board',
                        type: 'loading'
                    });

                    api.SerialMonitorHub.server.findBoardPort(board.mcu)
                        .then(function(port) {
                            alertsService.close(toast);
                            generateSerialWindow(port);
                        }, function(error) {
                            alertsService.add({
                                text: 'alert-web2board-no-port-found',
                                id: 'web2board',
                                type: 'warning'
                            });
                            console.error(error);
                        })
                        .finally(function() {
                            inProgress = false;
                        });
                });
            }
        };

        web2board.chartMonitor = function(board) {
            openSerialWindow('http://localhost:9000/#/chartMonitor', 'Chart monitor', board);
        };

        web2board.showSettings = function() {
            if (!inProgress) {
                openCommunication(function() {
                    inProgress = false;
                    var parent = $rootScope,
                        modalOptions = parent.$new();
                    _.extend(modalOptions, {
                        contentTemplate: '/views/modals/web2boardSettings.html',
                        modalTitle: 'modal-update-web2board-title',
                        modalText: 'modal-download-web2board-text',
                        confirmButton: 'save',
                        rejectButton: 'cancel',
                        modalButtons: true
                    });
                    modalOptions.envData = envData;
                    ngDialog.closeAll();
                    ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--download-web2board',
                        scope: modalOptions,
                        showClose: false,
                        controller: 'Web2boardSettingsCtrl'
                    });
                });
            }
        };

        web2board.version = function() {
            openCommunication(function() {
                return api.VersionsHandlerHub.server.getVersion;
            });
        };

        web2board.uploadHex = function(boardMcu, hexText) {
            openCommunication(function() {
                alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'web2board',
                    type: 'loading'
                });
                api.CodeHub.server.uploadHex(hexText, boardMcu)
                    .then(updateSuccessfullyFinished, handleUploadError).finally(removeInProgressFlag);
            });
        };

        return {
            connect: connect,
            verify: web2board.verify,
            upload: web2board.upload,
            serialMonitor: web2board.serialMonitor,
            chartMonitor: web2board.chartMonitor,
            version: web2board.version,
            uploadHex: web2board.uploadHex,
            showSettings: web2board.showSettings,
            isInProcess: function() {
                return inProgress;
            },
            setInProcess: function(value) {
                inProgress = value;
            },
            callFunction: function(called) {
                alertsService.closeByTag(called.alertServiceTag);
                web2board[called.name].apply(web2board[called.name], called.args);
            },
            openCommunication: openCommunication,
            api: api
        };

    });
