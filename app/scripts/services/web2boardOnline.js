'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardOnline
 * @description
 * # web2boardOnline
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardOnline', function(compilerApi, chromeAppApi, alertsService, utils, $q, $translate, envData, $rootScope, web2board, $timeout) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload
        };

        var compileAndUploadDefer,
            completed,
            alertCompile;

        function alertServerTimeout(alertCounter) {
            alertCounter = alertCounter || 0;
            if (!completed) {
                var alertText;
                switch (alertCounter) {
                    case 0:
                        alertText = 'compiler-traffic-warning';
                        break;
                    case 1:
                        alertText = 'compiler-inprogress';
                        break;
                    case 2:
                        alertText = 'compiler-still-inprogress';
                        break;
                }
                $timeout(function() {
                    if (!completed) {
                        alertCompile = alertsService.add({
                            text: alertText,
                            id: 'compiler-timeout',
                            type: 'warning'
                        });
                        if (alertCounter >= 2) {
                            alertCounter = 1;
                        } else {
                            alertCounter = alertCounter + 1;
                        }
                        alertServerTimeout(alertCounter);
                    }
                }, envData.config.compileErrorTime);
            }
        }

        /**
         * [compile description]
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise}
         */
        function compile(params) {
            if (!params.board) {
                params.board = 'bt328';
            } else {
                params.board = params.board.mcu;
            }
            if (!params.viewer) {
                alertsService.add({
                    text: 'alert-web2board-compiling',
                    id: 'compile',
                    type: 'loading'
                });
            }

            completed = false;

            alertServerTimeout();

            web2board.setInProcess(true);
            var compilerPromise = compilerApi.compile(params);
            if (!params.upload) {
                compilerAlerts(compilerPromise);
            } else {
                compilerPromise.finally(function() {
                    completed = true;
                });
            }
            return compilerPromise;

        }

        function compilerAlerts(compilerPromise) {
            alertCompile = null;

            compilerPromise.then(function(response) {
                    if (response.data.error) {
                        alertsService.add({
                            id: 'compile',
                            type: 'warning',
                            translatedText: utils.parseCompileError(response.data.error)
                        });
                    } else {
                        alertsService.add({
                            text: 'alert-web2board-compile-verified',
                            id: 'compile',
                            type: 'ok',
                            time: 5000
                        });
                    }
                }).catch(function(response) {
                    alertsService.add({
                        id: 'compile',
                        type: 'error',
                        translatedText: response.data
                    });
                })
                .finally(function() {
                    web2board.setInProcess(false);
                    completed = true;
                    alertsService.close(alertCompile);
                });

        }

        /**
         *
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise} request promise
         */
        function compileAndUpload(params) {
            if (!compileAndUploadDefer || (compileAndUploadDefer.promise.$$state.status !== 0)) {

                compileAndUploadDefer = $q.defer();
                params.upload = true;
                compile(utils.clone(params)).then(function(response) {
                    completed = true;
                    alertsService.closeByTag('compiler-timeout');
                    alertsService.closeByTag('upload');
                    alertsService.closeByTag('compile');
                    if (response.data.error) {
                        web2board.setInProcess(false);
                        alertsService.add({
                            id: 'compile',
                            type: 'warning',
                            translatedText: utils.parseCompileError(response.data.error)
                        });
                        compileAndUploadDefer.reject(response);
                    } else {
                        params.hex = response.data.hex;

                        upload(params).then(function(uploadResponse) {
                            compileAndUploadDefer.resolve(uploadResponse);
                        }).catch(function(uploadError) {
                            compileAndUploadDefer.reject(uploadError);
                            web2board.setInProcess(false);
                        });
                    }
                }).catch(function(error) {
                    compileAndUploadDefer.reject(error);
                    web2board.setInProcess(false);
                });
            }
            return compileAndUploadDefer.promise;
        }

        function getReadableErrorMessage(error) {
            var message = '';
            if (error.error.indexOf('timeout') >= 0) {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(error.error));
            } else {
                message = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(error.error));
            }
            //stk500 timeout.

            return message;
        }

        function upload(params, defer) {
            var uploadDefer = defer || $q.defer();
            if (params.viewer) {
                alertsService.add({
                    text: 'alert-viewer-reconfigure',
                    id: 'reconfigure',
                    type: 'loading'
                });
            } else {
                alertsService.add({
                    text: 'alert-web2board-uploading',
                    id: 'upload',
                    type: 'loading',
                    time: 'infinite'
                });
            }

            chromeAppApi.isConnected().then(function() {
                web2board.setInProcess(true);
                chromeAppApi.sendHex({
                    board: params.board.mcu,
                    file: params.hex
                }).then(function(uploadHexResponse) {
                    $rootScope.$emit('viewer-code:ready');
                    if (params.viewer) {
                        web2board.setInProcess(true);
                        alertsService.add({
                            text: 'alert-viewer-reconfigured',
                            id: 'reconfigure',
                            type: 'ok',
                            time: 5000
                        });
                    } else {
                        web2board.setInProcess(false);
                        alertsService.add({
                            text: 'alert-web2board-code-uploaded',
                            id: 'upload',
                            type: 'ok',
                            time: 5000
                        });
                    }

                    uploadDefer.resolve(uploadHexResponse);
                }).catch(function(error) {
                    var text;
                    if (error.error.search('no Arduino') !== -1) {
                        text = 'alert-web2board-no-port-found';
                    } else {
                        text = getReadableErrorMessage(error);
                    }
                    alertsService.add({
                        text: text,
                        id: 'upload',
                        type: 'error'
                    });
                    web2board.setInProcess(false);
                    uploadDefer.reject(error);
                });
            }).catch(function() {
                alertsService.closeByTag('upload');
                alertsService.add({
                    text: $translate.instant('landing_howitworks_oval_2_chromeos'),
                    id: 'chromeapp',
                    type: 'warning',
                    time: 20000,
                    linkText: $translate.instant('from-here'),
                    link: chromeAppApi.installChromeApp,
                    closeFunction: function() {
                        uploadDefer.reject({
                            error: 'rejeted by user'
                        });
                    },
                    linkParams: function(err) {
                        if (err) {
                            alertsService.add({
                                text: $translate.instant('error-chromeapp-install') + ': ' + $translate.instant(err.error),
                                id: 'chromeapp',
                                type: 'error'
                            });
                            uploadDefer.reject(err);
                        } else {
                            alertsService.add({
                                text: $translate.instant('chromeapp-installed'),
                                id: 'chromeapp',
                                type: 'ok',
                                time: 5000
                            });
                            upload(params, uploadDefer);
                        }
                    }
                });
            });

            return uploadDefer.promise;
        }

        return exports;
    });