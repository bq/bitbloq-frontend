'use strict';

var knownBoards = {
    zumjunior: {
        borndateBoard: 'zumjunior',
        libraries: [
            { zipURL: '/libraries/BQZUMJunior.zip', precompiled: true },
            {
                zipURL: '/libraries/BQZUMI2C7SegmentDisplay.zip',
                precompiled: true
            },
            { zipURL: '/libraries/ArduinoEventsLib.zip', precompiled: true }
        ],
        vendorId: 4292,
        productId: 60000
    }
};

/**
 * @ngdoc service
 * @name bitbloqApp.borndate
 * @description
 * # borndate
 * Service in the bitbloqApp.
 */
angular
    .module('bitbloqApp')
    .factory('borndate', function(alertsService, web2board, $q, $translate) {
        var exports = {
            compile: compile,
            compileAndUpload: compileAndUpload
        };

        var borndate = new Borndate.default({
            filesRoot: 'https://unpkg.com/@bitbloq/borndate@0.0.20/dist'
        });

        function openPort(board) {
            return $q(function(resolve, reject) {
                var avrgirl = new AvrgirlArduino({ board: 'zumjunior' });
                var connection = avrgirl.connection;
                var serialPortError = null;

                connection._init(function() {
                    return null;
                });
                connection._init = function(cb) {
                    return cb(null);
                };

                var boardConfig = knownBoards[board.mcu];

                connection.serialPort.requestOptions = {
                    filters: [
                        {
                            usbVendorId: boardConfig.vendorId,
                            usbProductId: boardConfig.productId
                        }
                    ]
                };

                connection.serialPort.open(function(error) {
                    if (error) {
                        serialPortError = error;
                        reject(error);
                    } else {
                        resolve(avrgirl);
                    }
                });
                connection.serialPort.open = function(cb) {
                    cb(serialPortError);
                };
            });
        }

        function callCompiler(params) {
            var code = params.code;
            var board = params.board;

            if (!board) {
                board = { mcu: 'bt328' };
            }

            var boardConfig = knownBoards[board.mcu];
            var compilePromise = borndate.compile(
                boardConfig.borndateBoard,
                [{ name: 'main.ino', content: code }],
                boardConfig.libraries
            );
            return compilePromise;
        }

        function compile(params) {
            alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'compile',
                type: 'loading'
            });
            web2board.setInProcess(true);
            callCompiler(params)
                .then(function() {
                    alertsService.add({
                        text: 'alert-web2board-compile-verified',
                        id: 'compile',
                        type: 'ok',
                        time: 5000
                    });
                })
                .catch(function(e) {
                    alertsService.add({
                        id: 'compile',
                        type: 'error',
                        text: e.errors
                            .map(function(error) {
                                return error.message;
                            })
                            .join('\n')
                    });
                })
                .finally(function() {
                    web2board.setInProcess(false);
                });
        }

        function compileAndUpload(params) {
            params.upload = true;
            web2board.setInProcess(true);
            openPort(params.board)
                .then(function(avrgirl) {
                    avrgirl.protocol.chip.verifyPage = function(
                        a,
                        b,
                        c,
                        d,
                        cb
                    ) {
                        cb();
                    };
                    alertsService.add({
                        text: 'alert-web2board-compiling',
                        id: 'compile',
                        type: 'loading'
                    });
                    callCompiler(params)
                        .then(function(hex) {
                            alertsService.closeByTag('compile');
                            alertsService.add({
                                text: params.viewer
                                    ? 'alert-viewer-reconfigure'
                                    : 'alert-web2board-uploading',
                                id: 'upload',
                                type: 'loading',
                                time: 'infinite'
                            });
                            var enc = new TextEncoder();
                            avrgirl.flash(enc.encode(hex), function(error) {
                                if (error) {
                                    console.log(error);
                                }
                                alertsService.add({
                                    text: 'alert-web2board-code-uploaded',
                                    id: 'upload',
                                    type: 'ok',
                                    time: 5000
                                });
                            });
                        })
                        .catch(function(e) {
                            avrgirl.connection.serialPort.reader.cancel();
                            avrgirl.connection.serialPort.close();
                            alertsService.add({
                                id: 'compile',
                                type: 'error',
                                text: e.errors
                                    .map(function(error) {
                                        return error.message;
                                    })
                                    .join('\n')
                            });
                        })
                        .finally(function() {
                            web2board.setInProcess(false);
                        });
                })
                .catch(function() {
                    web2board.setInProcess(false);
                    var link = function() {
                        var tempA = document.createElement('a');
                        tempA.setAttribute(
                            'href',
                            '#/support/p/noBoardLanding'
                        );
                        tempA.setAttribute('target', '_blank');
                        document.body.appendChild(tempA);
                        tempA.click();
                        document.body.removeChild(tempA);
                    };
                    var linkText = $translate.instant('support-go-to');
                    alertsService.add({
                        text: 'alert-web2board-no-port-found',
                        id: 'upload',
                        type: 'error',
                        link: link,
                        linkText: linkText
                    });
                });
        }

        return exports;
    });
