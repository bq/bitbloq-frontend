/*jshint ignore:start*/

'use strict';
// test
(function(WSHubsAPI) {

    'use strict';
    function HubsAPI(serverTimeout, wsClientClass, PromiseClass) {

        var messageID = 0,
            promisesHandler = {},
            defaultRespondTimeout = serverTimeout || 5000,
            thisApi = this,
            messagesBeforeOpen = [],
            emptyFunction = function () {},
            onOpenTriggers = [];

        PromiseClass = PromiseClass || Promise;
        if (!PromiseClass.prototype.finally) {
            PromiseClass.prototype.finally = function (callback) {
                var p = this.constructor;
                return this.then(
                    function (value) {
                        return p.resolve(callback()).then(function () {
                            return value;
                        });
                    },
                    function (reason) {
                        return p.resolve(callback()).then(function () {
                            throw reason;
                        });
                    });
            };
        }

        if (!PromiseClass.prototype.setTimeout) {
            PromiseClass.prototype.setTimeout = function (timeout) {
                clearTimeout(this._timeoutID);
                setTimeout(timeoutError(this._reject), timeout);
                return this;
            };
        }

        function timeoutError(reject) {
            return function () {
                reject(new Error('timeout error'));
            };
        }

        function toCamelCase(str) {
            return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
        }

        this.clearTriggers = function () {
            messagesBeforeOpen = [];
            onOpenTriggers = [];
        };

        this.connect = function (url, reconnectTimeout) {
            return new PromiseClass(function (resolve, reject) {
                reconnectTimeout = reconnectTimeout || -1;
                function reconnect(error) {
                    if (reconnectTimeout !== -1) {
                        window.setTimeout(function () {
                            thisApi.connect(reconnectTimeout);
                            thisApi.callbacks.onReconnecting(error);
                        }, reconnectTimeout * 1000);
                    }
                }

                try {
                    thisApi.wsClient = wsClientClass === undefined ? new WebSocket(url) : new wsClientClass(url);
                } catch (error) {
                    reconnect(error);
                    reject(error);
                }

                thisApi.wsClient.onopen = function () {
                    resolve();
                    thisApi.callbacks.onOpen(thisApi);
                    onOpenTriggers.forEach(function (trigger) {
                        trigger();
                    });
                    messagesBeforeOpen.forEach(function (message) {
                        thisApi.wsClient.send(message);
                    });
                };

                thisApi.wsClient.onclose = function (error) {
                    reject(error);
                    thisApi.callbacks.onClose(error);
                    reconnect(error);
                };

                thisApi.wsClient.addOnOpenTrigger = function (trigger) {
                    if (thisApi.wsClient.readyState === 0) {
                        onOpenTriggers.push(trigger);
                    } else if (thisApi.wsClient.readyState === 1) {
                        trigger();
                    } else {
                        throw new Error('web socket is closed');
                    }
                };

                thisApi.wsClient.onmessage = function (ev) {
                    try {
                        var promiseHandler,
                            msgObj = JSON.parse(ev.data);
                        if (msgObj.hasOwnProperty('replay')) {
                            promiseHandler = promisesHandler[msgObj.ID];
                            msgObj.success ? promiseHandler.resolve(msgObj.replay) : promiseHandler.reject(msgObj.replay);
                        } else {
                            msgObj.function = toCamelCase(msgObj.function);
                            var executor = thisApi[msgObj.hub].client[msgObj.function];
                            if (executor !== undefined) {
                                var replayMessage = {ID: msgObj.ID};
                                try {
                                    replayMessage.replay = executor.apply(executor, msgObj.args);
                                    replayMessage.success = true;
                                } catch (e) {
                                    replayMessage.success = false;
                                    replayMessage.replay = e.toString();
                                } finally {
                                    if (replayMessage.replay instanceof PromiseClass) {
                                        replayMessage.replay.then(function (result) {
                                            replayMessage.success = true;
                                            replayMessage.replay = result;
                                            thisApi.wsClient.send(JSON.stringify(replayMessage));
                                        }, function (error) {
                                            replayMessage.success = false;
                                            replayMessage.replay = error;
                                            thisApi.wsClient.send(JSON.stringify(replayMessage));
                                        });
                                    } else {
                                        replayMessage.replay = replayMessage.replay === undefined ? null : replayMessage.replay;
                                        thisApi.wsClient.send(JSON.stringify(replayMessage));
                                    }
                                }
                            } else {
                                thisApi.onClientFunctionNotFound(msgObj.hub, msgObj.function);
                            }
                        }
                    } catch (err) {
                        thisApi.wsClient.onMessageError(err);
                    }
                };

                thisApi.wsClient.onMessageError = function (error) {
                    thisApi.callbacks.onMessageError(error);
                };
            });
        };

        this.callbacks = {
            onClose: emptyFunction,
            onOpen: emptyFunction,
            onReconnecting: emptyFunction,
            onMessageError: emptyFunction,
            onClientFunctionNotFound: emptyFunction
        };

        this.defaultErrorHandler = null;

        var constructMessage = function (hubName, functionName, args) {
            if (thisApi.wsClient === undefined) {
                throw new Error('ws not connected');
            }
            var promise,
                timeoutID = null,
                _reject;
            promise = new PromiseClass(function (resolve, reject) {
                args = Array.prototype.slice.call(args);
                var id = messageID++,
                    body = {'hub': hubName, 'function': functionName, 'args': args, 'ID': id};
                promisesHandler[id] = {};
                promisesHandler[id].resolve = resolve;
                promisesHandler[id].reject = reject;
                timeoutID = setTimeout(timeoutError(reject), defaultRespondTimeout);
                _reject = reject;

                if (thisApi.wsClient.readyState === WebSocket.CONNECTING) {
                    messagesBeforeOpen.push(JSON.stringify(body));
                } else if (thisApi.wsClient.readyState !== WebSocket.OPEN) {
                    reject('webSocket not connected');
                } else {
                    thisApi.wsClient.send(JSON.stringify(body));
                }
            });
            promise._timeoutID = timeoutID;
            promise._reject = _reject;
            return promise;
        };

        this.CodeHub = {};
        this.CodeHub.server = {
            __HUB_NAME : 'CodeHub',

            uploadHex : function (hexText, board, port){
                arguments[0] = hexText === undefined ? null : hexText;
                return constructMessage('CodeHub', 'uploadHex', arguments);
            },

            upload : function (code, board, port){
                arguments[0] = code === undefined ? null : code;
                return constructMessage('CodeHub', 'upload', arguments);
            },

            uploadHexFile : function (hexFilePath, board, port){
                arguments[0] = hexFilePath === undefined ? null : hexFilePath;
                return constructMessage('CodeHub', 'uploadHexFile', arguments);
            },

            compile : function (code){

                return constructMessage('CodeHub', 'compile', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('CodeHub', 'get_subscribed_clients_to_hub', arguments);
            },

            subscribeToHub : function (){

                return constructMessage('CodeHub', 'subscribe_to_hub', arguments);
            },

            getHexData : function (code){

                return constructMessage('CodeHub', 'getHexData', arguments);
            },

            tryToTerminateSerialCommProcess : function (){

                return constructMessage('CodeHub', 'tryToTerminateSerialCommProcess', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('CodeHub', 'unsubscribe_from_hub', arguments);
            }
        };
        this.CodeHub.client = {};
        this.VersionsHandlerHub = {};
        this.VersionsHandlerHub.server = {
            __HUB_NAME : 'VersionsHandlerHub',

            getSubscribedClientsToHub : function (){

                return constructMessage('VersionsHandlerHub', 'get_subscribed_clients_to_hub', arguments);
            },

            setLibVersion : function (version){

                return constructMessage('VersionsHandlerHub', 'setLibVersion', arguments);
            },

            subscribeToHub : function (){

                return constructMessage('VersionsHandlerHub', 'subscribe_to_hub', arguments);
            },

            getVersion : function (){

                return constructMessage('VersionsHandlerHub', 'getVersion', arguments);
            },

            setWeb2boardVersion : function (version){

                return constructMessage('VersionsHandlerHub', 'setWeb2boardVersion', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('VersionsHandlerHub', 'unsubscribe_from_hub', arguments);
            }
        };
        this.VersionsHandlerHub.client = {};
        this.LoggingHub = {};
        this.LoggingHub.server = {
            __HUB_NAME : 'LoggingHub',

            subscribeToHub : function (){

                return constructMessage('LoggingHub', 'subscribe_to_hub', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('LoggingHub', 'get_subscribed_clients_to_hub', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('LoggingHub', 'unsubscribe_from_hub', arguments);
            },

            getAllBufferedRecords : function (){

                return constructMessage('LoggingHub', 'getAllBufferedRecords', arguments);
            }
        };
        this.LoggingHub.client = {};
        this.WindowHub = {};
        this.WindowHub.server = {
            __HUB_NAME : 'WindowHub',

            subscribeToHub : function (){

                return constructMessage('WindowHub', 'subscribe_to_hub', arguments);
            },

            forceClose : function (){

                return constructMessage('WindowHub', 'forceClose', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('WindowHub', 'get_subscribed_clients_to_hub', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('WindowHub', 'unsubscribe_from_hub', arguments);
            }
        };
        this.WindowHub.client = {};
        this.UtilsAPIHub = {};
        this.UtilsAPIHub.server = {
            __HUB_NAME : 'UtilsAPIHub',

            getHubsStructure : function (){

                return constructMessage('UtilsAPIHub', 'get_hubs_structure', arguments);
            },

            isClientConnected : function (clientId){

                return constructMessage('UtilsAPIHub', 'is_client_connected', arguments);
            },

            getId : function (){

                return constructMessage('UtilsAPIHub', 'get_id', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('UtilsAPIHub', 'get_subscribed_clients_to_hub', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('UtilsAPIHub', 'unsubscribe_from_hub', arguments);
            },

            subscribeToHub : function (){

                return constructMessage('UtilsAPIHub', 'subscribe_to_hub', arguments);
            },

            setId : function (clientId){

                return constructMessage('UtilsAPIHub', 'set_id', arguments);
            }
        };
        this.UtilsAPIHub.client = {};
        this.SerialMonitorHub = {};
        this.SerialMonitorHub.server = {
            __HUB_NAME : 'SerialMonitorHub',

            getAllConnectedPorts : function (){

                return constructMessage('SerialMonitorHub', 'getAllConnectedPorts', arguments);
            },

            closeAllConnections : function (){

                return constructMessage('SerialMonitorHub', 'closeAllConnections', arguments);
            },

            findBoardPort : function (board){

                return constructMessage('SerialMonitorHub', 'findBoardPort', arguments);
            },

            changeBaudrate : function (port, baudrate){

                return constructMessage('SerialMonitorHub', 'changeBaudrate', arguments);
            },

            write : function (port, data){

                return constructMessage('SerialMonitorHub', 'write', arguments);
            },

            closeConnection : function (port){

                return constructMessage('SerialMonitorHub', 'closeConnection', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('SerialMonitorHub', 'unsubscribe_from_hub', arguments);
            },

            subscribeToHub : function (){

                return constructMessage('SerialMonitorHub', 'subscribe_to_hub', arguments);
            },

            getAvailablePorts : function (){

                return constructMessage('SerialMonitorHub', 'getAvailablePorts', arguments);
            },

            startConnection : function (port, baudrate){
                arguments[0] = port === undefined ? 9600 : port;
                return constructMessage('SerialMonitorHub', 'startConnection', arguments);
            },

            isPortConnected : function (port){

                return constructMessage('SerialMonitorHub', 'isPortConnected', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('SerialMonitorHub', 'get_subscribed_clients_to_hub', arguments);
            }
        };
        this.SerialMonitorHub.client = {};
        this.ConfigHub = {};
        this.ConfigHub.server = {
            __HUB_NAME : 'ConfigHub',

            restorePlatformioIniFile : function (){

                return constructMessage('ConfigHub', 'restorePlatformioIniFile', arguments);
            },

            testProxy : function (proxyUrl){

                return constructMessage('ConfigHub', 'testProxy', arguments);
            },

            setWebSocketInfo : function (iP, port){

                return constructMessage('ConfigHub', 'setWebSocketInfo', arguments);
            },

            getLibrariesPath : function (){

                return constructMessage('ConfigHub', 'getLibrariesPath', arguments);
            },

            setLogLevel : function (logLevel){

                return constructMessage('ConfigHub', 'setLogLevel', arguments);
            },

            changePlatformioIniFile : function (content){

                return constructMessage('ConfigHub', 'changePlatformioIniFile', arguments);
            },

            subscribeToHub : function (){

                return constructMessage('ConfigHub', 'subscribe_to_hub', arguments);
            },

            getSubscribedClientsToHub : function (){

                return constructMessage('ConfigHub', 'get_subscribed_clients_to_hub', arguments);
            },

            isPossibleLibrariesPath : function (path){

                return constructMessage('ConfigHub', 'isPossibleLibrariesPath', arguments);
            },

            getConfig : function (){

                return constructMessage('ConfigHub', 'getConfig', arguments);
            },

            setProxy : function (proxyUrl){

                return constructMessage('ConfigHub', 'setProxy', arguments);
            },

            setLibrariesPath : function (libDir){

                return constructMessage('ConfigHub', 'setLibrariesPath', arguments);
            },

            setValues : function (configDic){

                return constructMessage('ConfigHub', 'setValues', arguments);
            },

            unsubscribeFromHub : function (){

                return constructMessage('ConfigHub', 'unsubscribe_from_hub', arguments);
            }
        };
        this.ConfigHub.client = {};
    }


    WSHubsAPI.construct = function(serverTimeout, wsClientClass) {
        return new HubsAPI(serverTimeout, wsClientClass);
    };
    // return WSHubsAPI;
})(window.WSHubsAPI = window.WSHubsAPI || {}, undefined);
/*jshint ignore:end*/