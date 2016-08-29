'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.faqsApi
 * @description
 * # faqsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('chromeAppApi', function($window, $q, envData, alertsService, $rootScope, $translate, $log) {
        var exports = {};

        var openPort,
            isConnectedPromise,
            uploadPromise,
            getPortsPromise;

        console.debug('chromeAppId', envData.config.chromeAppId);

        function connect() {

            if (!isConnectedPromise || isConnectedPromise.promise.$$state.status === 2) {
                isConnectedPromise = $q.defer();

                if ($window.chrome) {
                    try {
                        console.log('create port');

                        var timeoutId = setTimeout(function() {
                            timeoutId = null;
                            isConnectedPromise.reject({
                                error: 'CONNECTION_TIMEOUT'
                            });
                        }, 5000);

                        openPort = chrome.runtime.connect(envData.config.chromeAppId);
                        openPort.onDisconnect.addListener(function(d) {
                            //se desconecta todo el rato? usa 127.0.0.1 y no localhost
                            console.log('port disconnected', d);

                            if (timeoutId) {
                                clearTimeout(timeoutId);
                                isConnectedPromise.reject({
                                    error: 'CONNECTION_TIMEOUT'
                                });
                            }
                            isConnectedPromise = null;
                            openPort = null;
                        });

                        openPort.onMessage.addListener(function(msg) {
                            console.log('onMessage', msg, typeof(msg));
                            if (msg === 'connected') {
                                console.log('chromeapp connected');
                                clearTimeout(timeoutId);
                                isConnectedPromise.resolve();
                            } else if (typeof(msg) === 'object') {
                                var promise;
                                switch (msg.type) {
                                    case 'upload':
                                        promise = uploadPromise;
                                        break;
                                    case 'get-ports':
                                        promise = getPortsPromise;
                                        break;
                                    default:
                                        $log.log('unexpected msg type');
                                }
                                if (promise) {
                                    if (msg.success) {
                                        promise.resolve(msg);
                                    } else {
                                        promise.reject(msg);
                                    }
                                } else {
                                    $log.log('no promise prepared');
                                }
                            } else {
                                $rootScope.$emit('serial', msg);
                            }
                        });

                    } catch (exp) {
                        console.log('cant connect to plugin', exp);
                        isConnectedPromise.reject({
                            error: 'CANT_CONNECT_WITH_PLUGIN'
                        });
                    }
                } else {
                    isConnectedPromise.reject({
                        error: 'CHROME_NOT_DETECTED'
                    });
                }
            }

            return isConnectedPromise.promise;
        }

        exports.sendHex = function(message) {
            if (!uploadPromise || (uploadPromise.promise.$$state.status !== 0)) {
                uploadPromise = $q.defer();
                exports.isConnected().then(function() {
                    console.log('send hex');
                    message.type = 'upload';
                    if (message.board === 'bt328') {
                        message.board = 'bqZum';
                    }
                    openPort.postMessage(message);
                }).catch(function(error) {
                    uploadPromise.reject(error);
                });
                return uploadPromise.promise;
            } else {
                var dontUploadTwicePromise = $q.defer();
                dontUploadTwicePromise.reject({
                    error: 'ANOTHER_UPLOAD_IN_PROCESS'
                });
                return dontUploadTwicePromise.promise;
            }
        };

        exports.isConnected = function() {
            return connect();
        };

        exports.installChromeApp = function(callback) {
            var timeout = setTimeout(function() {
                callback({
                    error: 'CHROMEAPP_INSTALLATION_TIMEOUT'
                });
            }, 30000);
            alertsService.add({
                text: $translate.instant('chromeapp-installing'),
                id: 'web2board',
                type: 'loading'
            });
            chrome.webstore.install('https://chrome.google.com/webstore/detail/' + envData.config.chromeAppId, function(response) {
                console.log('response', response);
                clearTimeout(timeout);
                callback();
            }, function(error) {
                console.log('install error');
                console.log('error', error);
                clearTimeout(timeout);
                callback({
                    error: error
                });
            });
        };

        exports.stopSerialCommunication = function() {
            var message = {};
            message.type = 'serial-disconnect';
            openPort.postMessage(message);
        };

        exports.getSerialData = function(port) {
            exports.isConnected().then(function() {
                var message = {};
                message.type = 'serial-connect';
                message.port = port;
                openPort.postMessage(message);
            });
        };

        exports.sendSerialData = function(data) {
            exports.isConnected().then(function() {
                var message = {};
                message.type = 'serial-connect-send';
                message.data = data;
                openPort.postMessage(message);
            });
        };

        exports.changeBaudrate = function(baudrate) {
            exports.isConnected().then(function() {
                var message = {};
                message.type = 'change-baudrate';
                message.data = baudrate;
                openPort.postMessage(message);
            });
        };

        exports.getPorts = function() {
            if (!getPortsPromise || (getPortsPromise.promise.$$state.status !== 0)) {
                getPortsPromise = $q.defer();
                exports.isConnected().then(function() {
                    var message = {};
                    message.type = 'get-ports';
                    openPort.postMessage(message);
                }).catch(function(error) {
                    getPortsPromise.reject(error);
                });
                return getPortsPromise.promise;
            } else {
                return getPortsPromise.promise;
            }
        };

        return exports;
    });