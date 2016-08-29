'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardOnline
 * @description
 * # web2boardOnline
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardOnline', function(compilerApi, chromeAppApi, alertsService, utils, $q, $translate) {
        var exports = {
            compile: compile,
            upload: upload,
            compileAndUpload: compileAndUpload
        };

        var compileAndUploadDefer;

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

            alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'web2board',
                type: 'loading'
            });

            var compilerPromise = compilerApi.compile(params);

            compilerPromise.then(function(response) {
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
            }).catch(function(response) {
                alertsService.add({
                    id: 'web2board',
                    type: 'error',
                    translatedText: response.data
                });
            });

            return compilerPromise;
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

                compile(utils.clone(params)).then(function(response) {
                    if (response.data.error) {
                        compileAndUploadDefer.reject(response);
                    } else {
                        params.hex = response.data.hex;

                        upload(params).then(function(uploadResponse) {
                            compileAndUploadDefer.resolve(uploadResponse);
                        }).catch(function(uploadError) {
                            compileAndUploadDefer.reject(uploadError);
                        });
                    }
                }).catch(function(error) {
                    compileAndUploadDefer.reject(error);
                });
            }
            return compileAndUploadDefer.promise;
        }

        function upload(params) {
            var uploadDefer = $q.defer();

            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'web2board',
                type: 'loading',
                time: 'infinite'
            });

            chromeAppApi.isConnected().then(function() {
                chromeAppApi.sendHex({
                    board: params.board.mcu,
                    file: params.hex
                }).then(function(uploadHexResponse) {
                    alertsService.add({
                        text: 'alert-web2board-code-uploaded',
                        id: 'web2board',
                        type: 'ok',
                        time: 5000
                    });
                    uploadDefer.resolve(uploadHexResponse);
                }).catch(function(error) {
                    var text;
                    if (error.error.search('no Arduino') !== -1) {
                        text = 'alert-web2board-no-port-found';
                    } else {
                        text = $translate.instant('modal-inform-error-textarea-placeholder') + ': ' + $translate.instant(JSON.stringify(error));
                    }
                    alertsService.add({
                        text: text,
                        id: 'web2board',
                        type: 'error'
                    });
                    uploadDefer.reject(error);
                });
            }).catch(function() {
                alertsService.add({
                    text: $translate.instant('landing_howitworks_oval_2_chromeos'),
                    id: 'web2board',
                    type: 'warning',
                    time: 20000,
                    linkText: $translate.instant('from-here'),
                    link: chromeAppApi.installChromeApp,
                    linkParams: function(err) {
                        if (err) {
                            alertsService.add({
                                text: $translate.instant('error-chromeapp-install') + ': ' + $translate.instant(err.error),
                                id: 'web2board',
                                type: 'error'
                            });
                            uploadDefer.reject(err);
                        } else {
                            alertsService.add({
                                text: $translate.instant('chromeapp-installed'),
                                id: 'web2board',
                                type: 'ok',
                                time: 5000
                            });
                            upload(params);
                        }
                    }
                });
            });

            return uploadDefer.promise;
        }

        return exports;
    });