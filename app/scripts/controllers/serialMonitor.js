/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SerialMonitorCtrl', function($scope, _, web2boardV2, $translate, $timeout, $element, chromeAppApi, common, $rootScope, web2board, hardwareConstants,
        utils) {
        /*Private vars*/
        var serialHub = web2boardV2.api.SerialMonitorHub,
            textArea = $element.find('#serialData'),
            textAreaMaxLength = 20000;
        //its setted when the windows its open
        //$scope.board

        /*Private functions*/
        function scrollTextAreaToBottom() {
            $timeout(function() {
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }, 0);
        }

        /*Set up web2board api*/
        //when web2board tries to call a client function but it is not defined
        web2boardV2.api.onClientFunctionNotFound = function(hub, func) {
            console.error(hub, func);
        };

        serialHub.client.received = function(port, data) {
            if (port === $scope.port && !$scope.pause && angular.isString(data)) {
                $scope.serial.dataReceived += data;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
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

        /*Public functions*/
        $scope.send = function() {
            if (common.os === 'ChromeOS') {
                chromeAppApi.sendSerialData($scope.serial.input);
            } else {
                serialHub.server.write($scope.port, $scope.serial.input);
            }
            $scope.serial.input = '';
        };

        $scope.onKeyPressedInInput = function(event) {
            if (event.which === 13) {
                $scope.send();
            }
        };

        $scope.onBaudrateChanged = function(baudrate) {
            $scope.serial.baudrate = baudrate;
            if (common.os === 'ChromeOS') {
                chromeAppApi.changeBaudrate(baudrate);
            } else {
                serialHub.server.changeBaudrate($scope.port, baudrate);
            }
        };

        $scope.onPause = function() {
            $scope.pause = !$scope.pause;
            if ($scope.pause) {
                $scope.serial.dataReceived += '\n\nSerial Monitor paused\n\n';
                scrollTextAreaToBottom();
            }
            $scope.pauseText = $scope.pause ? $translate.instant('serial-play') : $translate.instant('serial-pause');
        };

        $scope.onClear = function() {
            $scope.serial.dataReceived = '';
        };

        $scope.getPorts = function() {
            chromeAppApi.getPorts().then(function(response) {
                console.log('ports SerialMonitorCtrl', response);
                $scope.ports = filterPortsByOS(response.ports);
                utils.getPortsPrettyNames($scope.ports, hardwareConstants.boards);
                $scope.portNames = [];

                for (var i = 0; i < $scope.ports.length; i++) {
                    $scope.portNames.push($scope.ports[i].portName);
                }

                var portWithUserSelectedBoard = utils.getPortByBoard($scope.ports, $scope.board);
                if (portWithUserSelectedBoard) {
                    $scope.setPort(portWithUserSelectedBoard.portName);
                }

            }).catch(function(error) {
                console.log('error SerialMonitorCtrl', error);
            });
        };

        $scope.setPort = function(portName) {
            var port = _.find($scope.ports, {
                portName: portName
            });

            $scope.selectedPort = port;

            chromeAppApi.getSerialData($scope.selectedPort);
        };

        function filterPortsByOS(ports) {
            var result = [];
            if (common.os === 'Mac') {
                for (var i = 0; i < ports.length; i++) {
                    if (ports[i].comName.indexOf('/dev/cu') !== -1) {
                        result.push(ports[i]);
                    }
                }
            } else {
                result = ports;
            }
            return result;
        }

        /*Init functions*/

        if (common.os === 'ChromeOS') {
            console.log($scope.board);
            $scope.getPorts();
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

        $rootScope.$on('serial', function(event, msg) {
            if (!$scope.pause && angular.isString(msg)) {
                $scope.serial.dataReceived += msg;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
            //    console.log('msg arrived: ', msg);
        });
        $scope.$on('$destroy', function() {
            if (common.os === 'ChromeOS') {
                chromeAppApi.stopSerialCommunication();
                web2board.setInProcess(false);
            } else {
                serialHub.server.unsubscribeFromPort($scope.port)
                    .then(function() {
                        return serialHub.server.closeUnusedConnections();
                    });
            }

        });
    });