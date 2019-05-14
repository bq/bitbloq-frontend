'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.CompilerApi
 * @description
 * # CompilerApi
 * Service in the bitbloqApp.
 */
angular
    .module('bitbloqApp')
    .service('compilerApi', function(envData, $q, $websocket, WSHubsAPI) {
        var exports = {
            compile: compile,
        };

        var api,
            host = envData.config.remoteWeb2boardHost,
            port = envData.config.remoteWeb2boardPort,
            timeoutResponse = 45000; //45 seconds
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

        function isWSConnected(wsClient) {
            return (
                wsClient &&
                (wsClient.readyState === WebSocket.CONNECTING ||
                    wsClient.readyState === WebSocket.OPEN)
            );
        }

        function connect() {
            return $q(function(resolve, reject) {
                try {
                    if (isWSConnected(api.wsClient)) {
                        resolve();
                    } else {
                        api.connect(
                            'wss://' + host + ':' + port + '/bitbloq'
                        ).then(resolve, reject);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }

        function compile(data) {
            return $q(function(resolve, reject) {
                connect().then(
                    function() {
                        var board = data.board;
                        var code = data.code;
                        return api.CodeHub.server
                            .compile(code, (board && board.mcu) || 'uno')
                            .then(
                                function(hex) {
                                    resolve({ data: { hex: hex } });
                                },
                                function(error) {
                                    resolve({ data: { error: error } });
                                }
                            );
                    },
                    function() {
                        reject({ data: 'remote-web2board-connection-error' });
                    }
                );
            });
        }

        api = WSHubsAPI.construct(timeoutResponse, webSocketWrapper, $q);

        return exports;
    });
