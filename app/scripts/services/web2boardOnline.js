'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardOnline
 * @description
 * # web2boardOnline
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardOnline', function (compilerApi, chromeAppApi, alertsService, utils, $q, $translate, envData, $rootScope, web2board) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload
        };

        var compileAndUploadDefer,
            completed;

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
              params.board = { mcu: 'bt328' };
            }
            if (!params.viewer) {
                alertsService.add({
                    text: 'alert-web2board-compiling',
                    id: 'compile',
                    type: 'loading'
                });
            }

            completed = false;

            web2board.setInProcess(true);
            var compilerPromise = compilerApi.compile(params);
            compilerAlerts(compilerPromise);
            if (!params.upload) {
                if (envData.config.env !== 'production') {
                    compilerPromise.then(function (res) {
                        console.log(res.data.hex);
                    })
                }
            } else {
                compilerPromise.finally(function () {
                    completed = true;
                });
            }
            return compilerPromise;

        }

        var errorLiterals = {
            'VERIFYERROR': 'alert-web2board-verifyerror',
            'UPLOADERROR': 'alert-web2board-uploaderror',
            'FILENOTFOUND': 'alert-web2board-filenotfound',
            'FILENOTCREATED': 'alert-web2board-filenotcreated',
            'DIRNOTCREATED': 'alert-web2board-dirnotcreated',
            'ARDUINONOTFOUND': 'alert-web2board-arduinonotfound',
            'BOARDNOTKNOWN': 'alert-web2board-boardnotknown',
            'BOARDNOTSET': 'alert-web2board-boardnotset',
            'BOARDNOTDETECTED': 'alert-web2board-boardnotdetected',
            'SKETCHNOTSET': 'alert-web2board-sketchnotset',
            'PORTNOTOPENED': 'alert-web2board-portnotopened',
            'CANNOTMOVELIBS': 'alert-web2board-cannotmovelibs',
            'GETTIMEOUT': 'alert-web2board-gettimeout'
        };

        function handleCompileError(error) {
            var errorStr = error,
                alertParams = {
                    id: 'compile',
                    type: 'warning'
                };
            if ((typeof (error) === 'object') && error.forEach) {
                var errorLines = [];
                error.forEach(function (errorLine) {
                    errorLines.push($translate.instant('alert-web2board-compile-line-error ', errorLine));
                });
                errorStr = errorLines.join('<br>');

                alertParams.translatedText = $translate.instant('alert-web2board-compile-error', {
                    value: '<br>' + errorStr
                });
            } else {
                alertParams.text = errorLiterals[error.title] || 'alert-web2board-compile-error';
                alertParams.value = error;
            }

            alertsService.add(alertParams);
        }

        function compilerAlerts(compilerPromise) {
            compilerPromise.then(function (response) {
                if (response.data.error) {
                    handleCompileError(response.data.error);
                } else {
                    alertsService.add({
                        text: 'alert-web2board-compile-verified',
                        id: 'compile',
                        type: 'ok',
                        time: 5000
                    });
                }
            }).catch(function (response) {
                alertsService.add({
                    id: 'compile',
                    type: 'error',
                    text: response.data
                });
            })
                .finally(function () {
                    web2board.setInProcess(false);
                    completed = true;
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
                compile(utils.clone(params)).then(function (response) {
                    completed = true;
                    alertsService.closeByTag('compiler-timeout');
                    alertsService.closeByTag('upload');
                    alertsService.closeByTag('compile');
                    if (response.data.error) {
                        web2board.setInProcess(false);
                        handleCompileError(response.data.error);
                        compileAndUploadDefer.reject(response);
                    } else {
                        params.hex = response.data.hex;

                        upload(params).then(function (uploadResponse) {
                            compileAndUploadDefer.resolve(uploadResponse);
                        }).catch(function (uploadError) {
                            compileAndUploadDefer.reject(uploadError);
                            web2board.setInProcess(false);
                        });
                    }
                }).catch(function (error) {
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
                    id: 'upload',
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

            chromeAppApi.isConnected().then(function () {
                web2board.setInProcess(true);
                chromeAppApi.sendHex({
                    board: params.board.mcu,
                    file: params.hex
                }).then(function (uploadHexResponse) {
                    $rootScope.$emit('viewer-code:ready');
                    if (params.viewer) {
                        web2board.setInProcess(true);
                        alertsService.add({
                            text: 'alert-viewer-reconfigured',
                            id: 'upload',
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
                }).catch(function (error) {
                    var text, link, linkText;
                    if (error.error.search('no Arduino') !== -1) {
                        text = 'alert-web2board-no-port-found';
                        link = function () {
                            var tempA = document.createElement('a');
                            tempA.setAttribute('href', '#/support/p/noBoardLanding');
                            tempA.setAttribute('target', '_blank');
                            document.body.appendChild(tempA);
                            tempA.click();
                            document.body.removeChild(tempA);
                        };
                        linkText = $translate.instant('support-go-to');
                    } else {
                        text = getReadableErrorMessage(error);
                    }
                    alertsService.add({
                        text: text,
                        id: 'upload',
                        type: 'error',
                        link: link,
                        linkText: linkText
                    });
                    web2board.setInProcess(false);
                    uploadDefer.reject(error);
                });
            }).catch(function () {
                alertsService.closeByTag('upload');
                alertsService.add({
                    text: $translate.instant('landing_howitworks_oval_2_chromeos'),
                    id: 'chromeapp',
                    type: 'warning',
                    time: 20000,
                    linkText: $translate.instant('from-here'),
                    link: chromeAppApi.installChromeApp,
                    closeFunction: function () {
                        uploadDefer.reject({
                            error: 'rejeted by user'
                        });
                    },
                    linkParams: function (err) {
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
