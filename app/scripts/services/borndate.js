'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.borndate
 * @description
 * # borndate
 * Service in the bitbloqApp.
 */
angular
    .module('bitbloqApp')
    .factory('borndate', function(alertsService, web2board, $q, $translate, projectService) {
        var knownBoards = {
            zumjunior: {
                avrgirlBoard: 'zumjunior',
                borndateBoard: 'zumjunior',
                libraries: [
                    { zipURL: '/libraries/SoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BQZUMJunior.zip', precompiled: true },
                    {
                        zipURL: '/libraries/BQZUMI2C7SegmentDisplay.zip',
                        precompiled: true
                    },
                    { zipURL: '/libraries/ArduinoEventsLib.zip', precompiled: true },
                    { zipURL: '/libraries/Servo.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqSoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BQZUMI2CTempSensor.zip', precompiled: true },
                    { zipURL: '/libraries/BQZUMI2CALPSSensor.zip', precompiled: true },
                    { zipURL: '/libraries/BQZUMI2CColorSensor.zip', precompiled: true }
                ],
                vendorId: [4292],
                productId: [60000]
            },
            zumcore2: {
                avrgirlBoard: 'zumcore2',
                borndateBoard: 'zumcore2',
                libraries: [
                    { zipURL: '/libraries/SoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqSoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqButtonPad.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqEncoder.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqJoystick.zip', precomipled: true },
                    { zipURL: '/libraries/BitbloqLineFollower.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqLiquidCrystal.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRGB.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRTC.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqHTS221.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqUS.zip', precompiled: true },
                    { zipURL: '/libraries/Servo.zip', precompiled: true },
                    { zipURL: '/libraries/Adafruit_NeoPixel.zip', precompiled: true },
                ],
                vendorId: [4292],
                productId: [60000]
            },
            bt328: {
                avrgirlBoard: 'bqZum',
                borndateBoard: 'zumcore',
                libraries: [
                    { zipURL: '/libraries/SoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqSoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqButtonPad.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqEncoder.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqJoystick.zip', precomipled: true },
                    { zipURL: '/libraries/BitbloqLineFollower.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqLiquidCrystal.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRGB.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRTC.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqHTS221.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqUS.zip', precompiled: true },
                    { zipURL: '/libraries/Servo.zip', precompiled: true },
                    { zipURL: '/libraries/Adafruit_NeoPixel.zip', precompiled: true },
                ],
                vendorId: [1027],
                productId: [24577]
            },
            uno: {
                avrgirlBoard: 'uno',
                borndateBoard: 'uno',
                libraries: [
                    { zipURL: '/libraries/SoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqSoftwareSerial.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqButtonPad.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqEncoder.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqJoystick.zip', precomipled: true },
                    { zipURL: '/libraries/BitbloqLineFollower.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqLiquidCrystal.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRGB.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqRTC.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqHTS221.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqUS.zip', precompiled: true },
                    { zipURL: '/libraries/Servo.zip', precompiled: true },
                    { zipURL: '/libraries/Adafruit_NeoPixel.zip', precompiled: true },
                    { zipURL: '/libraries/Wire.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqDCMotor.zip' }
                ],
                vendorId: [9025,9025,10755],
                productId: [67,1,67]
            }
        };

        var exports = {
            compile: compile,
            compileAndUpload: compileAndUpload,
            knownBoards: knownBoards
        };

        var borndate = new Borndate.default({
            filesRoot: 'https://unpkg.com/@bitbloq/borndate@0.0.20/dist'
        });

        function openPort(board) {
            return $q(function(resolve, reject) {
                var boardConfig = knownBoards[board.mcu];
                var avrgirl = new AvrgirlArduino({ board: boardConfig.avrgirlBoard });
                var connection = avrgirl.connection;
                var serialPortError = null;

                connection._init(function() {
                    return null;
                });
                connection._init = function(cb) {
                    return cb(null);
                };

                connection.serialPort.requestOptions = {
                    filters: boardConfig.vendorId.map((usbVendorId) => {
                      return { usbVendorId };
                    }),
                    // [
                    //     {
                    //         usbVendorId: boardConfig.vendorId
                    //     }
                    // ]
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
            var libraries = boardConfig.libraries;

            if (projectService.project.hardware.robot === 'zowi') {
                libraries = libraries.concat([
                    { zipURL: '/libraries/BitbloqZowi.zip' },
                    { zipURL: '/libraries/BitbloqOscillator.zip' },
                    { zipURL: '/libraries/BitbloqLedMatrix.zip' },
                    { zipURL: '/libraries/BitbloqBatteryReader.zip' },
                    { zipURL: '/libraries/EEPROM.zip', precompiled: true }
                ]);
            }
            if (projectService.project.hardware.robot === 'evolution' ||
                projectService.project.hardware.robot === 'evolution20') {
                libraries = libraries.concat([
                    { zipURL: '/libraries/BitbloqEvolution.zip', precompiled: true },
                    { zipURL: '/libraries/BitbloqOscillator.zip' },
                ]);
            }
            if (projectService.project.hardware.board === 'mcore') {
                libraries = libraries.concat([
                    { zipURL: '/libraries/BitbloqMBotV2.zip' },
                    { zipURL: '/libraries/BitbloqMStarter.zip' },
                    { zipURL: '/libraries/BitbloqMPort.zip' },
                    { zipURL: '/libraries/BitbloqMeRGBLED.zip' },
                    { zipURL: '/libraries/BitbloqMIRControl.zip' },
                    { zipURL: '/libraries/BitbloqIRRemote.zip' },
                    { zipURL: '/libraries/BitbloqCompass.zip' },
                    { zipURL: '/libraries/Bitbloq7SegmentDisplay.zip' },
                    { zipURL: '/libraries/BitbloqMCore.zip' },
                    { zipURL: '/libraries/BitbloqMeLEDMatrix.zip' },
                    { zipURL: '/libraries/BitbloqMBotDeprecated.zip', precompiled: true },
                    { zipURL: '/libraries/EEPROM.zip', precompiled: true }
                ]).filter(function(lib) {
                    return lib.zipURL !== '/libraries/Servo.zip';
                });
            }
            var compilePromise = borndate.compile(
                boardConfig.borndateBoard,
                [{ name: 'main.ino', content: code }],
                libraries
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
                    avrgirl.protocol.chip.verify = function(
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
