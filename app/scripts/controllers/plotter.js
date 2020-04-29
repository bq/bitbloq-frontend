/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:PlotterCtrl
 * @description
 * # PlotterCtrl
 * Plotter controller
 */
angular.module('bitbloqApp')
    .controller('PlotterCtrl', function($element, web2boardV2, web2board, $timeout, $scope, $translate, common, browserSerial, utils, hardwareService, $rootScope) {

        var serialHub = web2boardV2.api.SerialMonitorHub,
            dataParser = {
                buf: '',
                separator: '\r\n',
                retrieve_messages: function(data) {
                    data = this.buf + data;
                    var split_data = data.split(this.separator);
                    this.buf = split_data.pop();
                    return split_data;
                }
            },
            plotterLength = 30,
            receivedDataCount = -1;

        //its setted when the windows its open
        //$scope.board

        /*Private functions*/

        /*Set up web2board api*/
        //when web2board tries to call a client function but it is not defined
        web2boardV2.api.onClientFunctionNotFound = function(hub, func) {
            console.error(hub, func);
        };

        serialHub.client.received = function(port, data) {
            if (port === $scope.port && !$scope.pause && angular.isString(data)) {
                var messages = dataParser.retrieve_messages(data);
                messages.forEach(function(message) {
                    var number = parseFloat(message);
                    if (!$scope.pause && !isNaN(number)) {
                        if (receivedDataCount === 0) {
                            receivedDataCount++;
                        } else {
                            $scope.data[0].values.push({
                                x: receivedDataCount++,
                                y: number
                            });
                        }
                        if ($scope.data[0].values.length > plotterLength) {
                            $scope.data[0].values.shift();
                        }
                    }
                });
                $scope.$apply();
            }
        };

        serialHub.client.written = function(message) {
            $scope.serial.dataReceived += message;
        };

        // function called when someone writes in serial (including ourselves)
        // serialHub.client.written = function (message) {
        //     $scope.serial.dataReceived += message;
        // };

        /*public vars*/
        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.serial = {
            dataReceived: '',
            input: '',
            baudrate: 9600
        };
        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

        $scope.data = [{
            values: [],
            color: '#82ad3a'
        }];

        $scope.chartOptions = {
            chart: {
                type: 'lineChart',
                height: null,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                duration: 0,
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    return d.y;
                },
                showLegend: false,
                useInteractiveGuideline: true
            }
        };

        /*Public functions*/

        $scope.onKeyPressedInInput = function(event) {
            if (event.which === 13) {
                $scope.send();
            }
        };

        $scope.onBaudrateChanged = function(baudrate) {
            $scope.serial.baudrate = baudrate;
            if (common.useChromeExtension()) {
                browserSerial.close().then(function() {
                  browserSerial.connect($scope.board, baudrate);
                });
            } else {
                serialHub.server.changeBaudrate($scope.port, baudrate);
            }
        };

        $scope.onPause = function() {
            $scope.pause = !$scope.pause;
            $scope.pauseText = $scope.pause ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
        };

        $scope.onClear = function() {
            receivedDataCount = 0;
            $scope.data[0].values = [];
        };

        /*Init functions*/

        if (common.useChromeExtension() || $scope.forceChromeExtension) {
            browserSerial.connect($scope.board, $scope.serial.baudrate);
        } else {
            serialHub.server.subscribeToPort($scope.port);

            serialHub.server.startConnection($scope.port, $scope.serial.baudrate)
                .catch(function(error) {
                    if (error.error.indexOf('already in use') > -1) {
                        $scope.onBaudrateChanged($scope.serial.baudrate);
                    } else {
                        console.error(error);
                    }
                });

            $scope.setOnUploadFinished(function() {
                $scope.onBaudrateChanged($scope.serial.baudrate);
            });
        }

        var serialEvent = $rootScope.$on('serial', function(event, msg) {
            if (!$scope.pause && angular.isString(msg)) {
                var messages = dataParser.retrieve_messages(msg);
                messages.forEach(function(message) {
                    var number = parseFloat(message);
                    if (!$scope.pause && !isNaN(number)) {
                        if (receivedDataCount === -1) {
                            receivedDataCount++;
                        } else {
                            $scope.data[0].values.push({
                                x: receivedDataCount++,
                                y: number
                            });
                        }
                        if ($scope.data[0].values.length > plotterLength) {
                            $scope.data[0].values.shift();
                        }
                    }
                });
                $scope.$apply();
            } else {
                window.dispatchEvent(new Event('resize'));
            }
        });

        $scope.$on('$destroy', function() {
            receivedDataCount = 0;
            $scope.data = [{
                values: [],
                color: '#82ad3a'
            }];
            if (common.useChromeExtension()) {
                browserSerial.close();
                web2board.setInProcess(false);
            } else {
                serialHub.server.unsubscribeFromPort($scope.port)
                    .then(function() {
                        return serialHub.server.closeUnusedConnections();
                    });
            }
            serialEvent();

        });

    });
