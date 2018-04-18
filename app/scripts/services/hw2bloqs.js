'use strict';
angular
    .module('bitbloqApp')
    .service('hw2Bloqs', function (jsPlumb, $log, $window, jsPlumbUtil) {
        var exports = {},

            board = null,
            boardContainerId = null,
            boardDOMElement = null,
            containerDefault = null,
            componentDragging = null,
            oldConnections = [],
            robot = null,
            robotContainerId = null,
            robotDOMElement = null,

            config = {
                color: '#F1C933',
                colorHover: '#F19833'
            },
            connectionEvent = new CustomEvent('connectionEvent'),
            jsPlumbInstance = null,
            oppositeI2cPin = {
                a4: 'a5',
                a5: 'a4'
            };

        /*jshint validthis:true */
        exports.initialize = function (container, boardContainerIdRef, robotContainerIdRef) {

            if (!container) {
                throw Error;
            }

            containerDefault = container;
            boardContainerId = boardContainerIdRef;
            robotContainerId = robotContainerIdRef;

            jsPlumbInstance = jsPlumb.getInstance();
            jsPlumbInstance.setContainer(container);
            jsPlumbInstance.importDefaults({
                DragOptions: {
                    cursor: 'pointer',
                    zIndex: 2000
                },
                DropOptions: {
                    tolerance: 'touch',
                    cursor: 'crosshair',
                    hoverClass: 'dropHover',
                    activeClass: 'dragActive'
                },
                Connector: ['Flowchart', {
                    cornerRadius: 5,
                    alwaysRespectStubs: false,
                    midpoint: 1,
                    stub: [10, 40],
                    gap: 2
                }],
                EndpointStyle: {
                    fillStyle: config.color,
                    strokeStyle: config.colorHover
                },
                EndpointHoverStyle: {
                    fillStyle: config.colorHover
                },
                PaintStyle: {
                    fillStyle: config.color,
                    strokeStyle: config.color
                },
                HoverPaintStyle: {
                    fillStyle: config.colorHover,
                    strokeStyle: config.colorHover
                },
                MaxConnections: 1
            });

            _registerJsPlumbTypes();
            _connectionListeners();

            // window.removeEventListener('optimizedResize');
            $window.addEventListener('optimizedResize', function () {
                exports.repaint();
            }, false);

            // window.removeEventListener('focus');
            $window.addEventListener('focus', function () {
                exports.repaint();
            }, false);

            document.addEventListener('mouseup', _onMouseUpHandler);

        };

        exports.addBoard = function (newBoard) {
            exports.removeBoard();

            board = newBoard;

            boardDOMElement = document.getElementById(boardContainerId);
            boardDOMElement.classList.add(board.uuid || board.id);
            boardDOMElement.classList.add('opaque');
            robotDOMElement = document.getElementById(robotContainerId);
            robotDOMElement.classList.remove('opaque');

            _loadBoard(board, boardDOMElement);
            _autoConnect(board.uuid || board.id);
            exports.repaint();
        };

        exports.addComponent = function (newComponent) {
            if (!newComponent) {
                throw new Error('You need provide a component element :: addComponent');
            }
            if (!newComponent.uid) {
                newComponent.uid = jsPlumbUtil.uuid();
            }

            var DOMComponent = document.createElement('img');

            containerDefault.appendChild(DOMComponent);

            DOMComponent.dataset.uid = newComponent.uid;
            DOMComponent.dataset.target = 'component-context-menu';
            DOMComponent.dataset.name = newComponent.name;
            DOMComponent.setAttribute('context-menu', true);
            DOMComponent.classList.add('component');
            DOMComponent.style.top = newComponent.coordinates.y + '%';
            DOMComponent.style.left = newComponent.coordinates.x + '%';
            DOMComponent.src = '/images/components/' + newComponent.uuid + '.svg';
            DOMComponent.style.width = newComponent.width + 'px';
            DOMComponent.style.height = newComponent.height + 'px';
            DOMComponent.draggable = true;

            $('.component_ep').removeClass('selected');

            DOMComponent.addEventListener('mousedown', _onMouseDownHandler);

            _loadComponent(DOMComponent, newComponent);
            exports.repaint();

            return DOMComponent;
        };

        exports.addRobot = function (newRobot) {
            robotDOMElement = document.getElementById(robotContainerId);
            robotDOMElement.classList.add(newRobot.id || newRobot.uuid);

            robotDOMElement.classList.add('opaque');
            boardDOMElement = document.getElementById(boardContainerId);
            boardDOMElement.classList.remove('opaque');
            robot = newRobot;
        };

        exports.disconnectComponent = function (component) {
            var el = document.querySelector('[data-uid="' + component.uid + '"]');
            jsPlumbInstance.select({
                source: el.id
            }).detach();
        };

        exports.disconnectAllComponents = function () {
            jsPlumbInstance.detachAllConnections(boardDOMElement);
        };

        /**
         * [loadSchema It loads a board schema]
         * @param  {[type]} schema [description]
         * @return {[type]}        [description]
         */
        exports.loadSchema = function (newSchema) {
            $log.debug('start loading schema ');
            $log.debug(newSchema);

            this.schema = newSchema;
            var ref = this;

            if (ref.schema.robot) {
                exports.addRobot(ref.schema.robot);
            } else if (ref.schema.board) {
                //Add board
                exports.addBoard(ref.schema.board);

                //Add components
                this.schema.components.forEach(function (component) {
                    exports.addComponent(component, true);
                });

                //Add connections
                this.schema.connections.forEach(function (connection) {
                    if (jsPlumbInstance.getEndpoint(connection.pinSourceUid).isFull()) {
                        return false;
                    }

                    jsPlumbInstance.connect({
                        uuids: [connection.pinSourceUid, connection.pinTargetUid],
                        type: 'automatic'
                    });

                });
            } else {
                $log.debug('Unable to add board', ref.schema);
            }

            exports.repaint();

        };

        exports.removeBoard = function () {
            if (jsPlumbInstance && board && boardDOMElement) {
                oldConnections = [];
                var connections = jsPlumbInstance.getConnections();
                connections.forEach(function (connection) {
                    oldConnections.push(connection.getParameters());
                });
                boardDOMElement.classList.remove(board.uuid);
                jsPlumbInstance.removeAllEndpoints(boardDOMElement);
            }
            board = null;
        };

        exports.removeComponent = function (component) {
            component.removeEventListener('mousedown', _onMouseDownHandler);
            component.removeEventListener('mouseup', _onMouseUpHandler);

            jsPlumbInstance.getConnections(component).forEach(function (conn) {
                conn.setType('removing');
            });
            jsPlumbInstance.detachAllConnections(component);
            jsPlumbInstance.remove(component);
        };

        exports.removeAllComponents = function () {
            jsPlumbInstance.deleteEveryEndpoint();
            var nodeList = containerDefault.querySelectorAll('.component');
            [].forEach.call(nodeList, function (el) {
                el.removeEventListener('mousedown', _onMouseDownHandler);
                el.removeEventListener('mouseup', _onMouseUpHandler);

                jsPlumb.remove(el);
            });
        };

        exports.removeSelectedConnection = function () {
            var componentUid;
            jsPlumbInstance.getAllConnections().forEach(function (con) {
                if (con.hasType('selected')) {
                    con.endpoints.forEach(function (elem) {
                        elem.removeType('selected');
                        elem.removeClass('selected');
                    });
                    componentUid = con.endpoints[0].element.dataset.uid;
                    jsPlumbInstance.detach(con);
                }
            });
            return componentUid;
        };

        exports.removeRobot = function () {
            if (jsPlumbInstance && robot && robotDOMElement) {
                robotDOMElement.classList.remove(robot.uuid);
                jsPlumbInstance.removeAllEndpoints(robotDOMElement);
            }
            robot = null;
        };

        var repaintTimer;

        function _repaint() {
            try {
                jsPlumbInstance.repaintEverything();
            } catch (e) {
                $log.debug('protoboard container reference lost!. Re-engage', e);
            }
        }

        exports.repaint = function () {
            if (!repaintTimer) {
                repaintTimer = setTimeout(function () {
                    repaintTimer = null;
                    _repaint();
                }, 200);
            }
        };

        exports.saveSchema = function () {

            var schema = {
                components: [],
                connections: []
            };
            var endpointsRef = {};

            function _setParameters(ep) {
                endpointsRef[ep.getParameter('pinComponent')] = {
                    uid: ep.getUuid(),
                    type: ep.scope
                };
            }

            var componentList = [].slice.call(containerDefault.querySelectorAll('.component'));
            componentList.forEach(function (item) {

                var endpoints = jsPlumbInstance.getEndpoints(item);

                if (endpoints && endpoints.length > 0) {

                    endpointsRef = {};
                    endpoints.forEach(_setParameters);

                    var connections = jsPlumbInstance.getConnections({
                        source: item
                    });

                    if (connections.length) { //components disconnected are not saving
                        schema.components.push({
                            endpoints: endpointsRef,
                            uid: item.dataset.uid,
                            connected: connections.length > 0
                        });
                    }
                }
            });

            //Store connections data
            schema.connections = _getConnections();

            return schema;
        };

        exports.unselectAllConnections = function () {
            jsPlumbInstance.getAllConnections().forEach(function (con) {
                con.removeType('selected');

                con.canvas.classList.remove('selected');

                con.endpoints.forEach(function (ep) {
                    ep.removeType('selected');
                    ep.canvas.classList.remove('selected');
                });
            });
        };
        exports.checkIfOldConnections = function () {
            return oldConnections.length > 0;
        };

        function _autoConnect(board) {
            if (oldConnections.length > 0) {
                var i2cToFemale = (board === 'ArduinoUNO' || board === 'ArduinoMEGA2560');
                oldConnections.forEach(function (connection) {
                    var pin = connection.pinNames[Object.keys(connection.pinNames)[0]].toLowerCase();
                    if (i2cToFemale && (pin === 'a4' || pin === 'a5')) {
                        pin = pin + '-h';
                    }

                    var epBoardReference = _getPinBoardReference('.board_ep-' + connection.type + '.pin-' + pin);
                    if (epBoardReference) {
                        jsPlumbInstance.connect({
                            uuids: [connection.pinSourceUid, epBoardReference.getUuid()],
                            type: 'automatic'
                        });
                    }
                });
                oldConnections = [];
            }
        }

        exports.userInteraction = false;

        function _checkPinsI2C(connection, connecting) {
            var endpoint = connection.targetEndpoint || connection.originalTargetEndpoint,
                currentPin = endpoint.getParameter('pinBoard').toLowerCase();
            var typePin = endpoint.scope.split('-')[0] || endpoint.scope;
            if (typePin === 'i2c' && (currentPin === 'a4' || currentPin === 'a5' || currentPin === 'a4-h' || currentPin === 'a5-h')) {
                if (connecting) {
                    _detachAllByAnalogPin('a4');
                    _detachAllByAnalogPin('a5');
                    _setVisiblePins('analog', false);

                } else {
                    //Check for connections with pin type=endpoint.scope
                    var pin4hBoardReference = _getPinBoardReference('.board_ep-i2c.pin-a4-h'),
                        pin5hBoardReference = _getPinBoardReference('.board_ep-i2c.pin-a5-h'),
                        lengthPins = {
                            'a4-h': 0,
                            'a5-h': 0
                        };
                    lengthPins[currentPin] = 1;
                    if (pin4hBoardReference && pin5hBoardReference && pin4hBoardReference.connections.length === lengthPins['a4-h'] && pin5hBoardReference.connections.length === lengthPins['a5-h']) {
                        if (oppositeI2cPin[currentPin]) {
                            // currentPin is a4 or a5
                            var oppositePinBoardReference = _getPinBoardReference('.board_ep-i2c.pin-' + oppositeI2cPin[currentPin]);
                            if (oppositePinBoardReference && oppositePinBoardReference.connections.length === 0) {
                                _setVisiblePins('analog', true);
                            }
                        } else {
                            // currentPint is a4-h or a5-h
                            var pin4BoardReference = _getPinBoardReference('.board_ep-i2c.pin-a4'),
                                pin5BoardReference = _getPinBoardReference('.board_ep-i2c.pin-a5');
                            if (pin4BoardReference && pin5BoardReference) {
                                if (pin4BoardReference.connections.length === 0 && pin5BoardReference.connections.length === 0) {
                                    _setVisiblePins('analog', true);
                                }
                            } else {
                                _setVisiblePins('analog', true);
                            }
                        }
                    }
                }
            }
        }

        function _connectionListeners() {

            jsPlumbInstance.unbind('click');
            jsPlumbInstance.unbind('connection');
            jsPlumbInstance.unbind('connectionDetached');

            jsPlumbInstance.bind('connection', _connectionAction);
            jsPlumbInstance.bind('connectionDetached', _connectionDetachedAction);
            jsPlumbInstance.bind('connectionMoved', _connectionMovedAction);

        }

        function _connectionAction(connection) {
            connection.targetEndpoint.setType('connected');
            connection.sourceEndpoint.setType('connected');

            var pinAssignation = {};
            pinAssignation[connection.sourceEndpoint.getParameter('pinComponent')] = connection.targetEndpoint.getParameter('pinBoard');

            connection.connection.setParameters({
                pinSourceUid: connection.sourceEndpoint.getUuid(),
                pinTargetUid: connection.targetEndpoint.getUuid(),
                pinNames: pinAssignation,
                type: connection.targetEndpoint.scope
            });

            var componentData = {
                uid: connection.source.dataset.uid,
                connections: [connection.connection],
                pin: pinAssignation
            };

            connection.connection.bind('click', function (c) {
                exports.unselectAllConnections();
                _selectConnection(c);
            });

            connectionEvent.componentData = componentData;
            connectionEvent.protoBoLaAction = 'attach';
            connectionEvent.protoBoLaActionParent =
                connection.connection.hasType('undoredo') || connection.connection.hasType('removing') || connection.connection.getData().undoredo;

            if (connection.target.classList.contains('board')) {
                containerDefault.dispatchEvent(connectionEvent);
            }
            _checkPinsI2C(connection, true);
        }

        function _connectionDetachedAction(connection) {
            connection.targetEndpoint.removeType('connected');
            connection.sourceEndpoint.removeType('connected');

            var pinAssignation = {};
            pinAssignation[connection.sourceEndpoint.getParameter('pinComponent')] = undefined;

            var componentData = {
                uid: connection.source.dataset.uid,
                id: connection.source.dataset.id,
                category: connection.source.dataset.category,
                pin: pinAssignation,
                connections: [connection.connection]
            };

            _unselectConnection(connection.connection);

            connection.connection.unbind('click');

            connectionEvent.componentData = componentData;
            connectionEvent.protoBoLaAction = 'detach';
            connectionEvent.protoBoLaActionParent =
                connection.connection.hasType('undoredo') || connection.connection.hasType('removing') || connection.connection.getData().undoredo;

            if (connection.target.classList.contains('board')) {
                containerDefault.dispatchEvent(connectionEvent);
            }
            _checkPinsI2C(connection, false);
        }

        function _connectionMovedAction(connection) {
            connection.originalTargetEndpoint.removeType('selected');
            connection.originalTargetEndpoint.removeClass('selected');
            connection.originalTargetEndpoint.removeClass('endpointDrag');
            exports.userInteraction = true;
            _checkPinsI2C(connection, false);
        }

        function _detachAllByAnalogPin(pinBoard) {
            var analogPinBoard = _getPinBoardReference('.board_ep-analog.pin-' + pinBoard);
            if (analogPinBoard) {
                analogPinBoard.detachAll();
            }
        }

        function _getConnections() {
            return jsPlumbInstance.getAllConnections().map(function (connection) {

                var connectionParams = connection.getParameters();
                return ({
                    pinSourceUid: connectionParams.pinSourceUid,
                    pinTargetUid: connectionParams.pinTargetUid
                });

            }) || [];
        }

        function _getPinBoardReference(selector) {
            var pinBoardReference,
                pinBoardDOM = document.querySelector(selector);
            if (pinBoardDOM) {
                pinBoardReference = pinBoardDOM._jsPlumb;
            }
            return pinBoardReference;
        }

        function _loadBoard(board, boardDOMElement) {
            function addEndPoint(pin) {

                var overLayLocation = [];
                switch (type) {
                    case 'digital':
                        overLayLocation = [0.5, 1.5];
                        break;
                    case 'analog':
                        overLayLocation = [0.5, -0.5];
                        break;
                    case 'i2c':
                        overLayLocation = [0.5, -2];
                        break;
                    default:
                        overLayLocation = [0.5, -0.5];
                }
                var typeClass = 'board_ep board_ep-' + type;
                if (type.split('-').length > 1) {
                    typeClass = 'board_ep board_ep-' + type.split('-')[0] + ' board_ep board_ep-' + type;
                }
                var pinName = pin.name.split('-')[0],
                    options = {
                        anchor: [pin.x, pin.y, 0, -1, 0, 0],
                        endpoint: ['Rectangle', {
                            width: board.pinSize[type].w,
                            height: board.pinSize[type].h
                        }],
                        overlays: [
                            ['Label', {
                                label: 'Pin ' + pinName,
                                labelStyle: {
                                    color: 'black'
                                },
                                location: overLayLocation
                            }]
                        ],
                        parameters: {
                            pinBoard: pin.name
                        },
                        cssClass: typeClass + ' pin-' + pin.name.toLowerCase(),
                        isTarget: true,
                        isSource: false,
                        scope: type,
                        uuid: pin.uid
                    };

                if (type.split('-')[0] === 'i2c' && pin.name.split('-')[1] === 'H') {
                    options.maxConnections = -1;
                }

                //Create a 'basic' endpoint
                var epBoard = jsPlumbInstance.addEndpoint(boardDOMElement, options);

                epBoard.unbind('click');
                epBoard.bind('click', function (ep) {
                    if (ep.hasType('selected')) {
                        return false;
                    }
                    //Remove other connections & ep selected
                    jsPlumbInstance.getAllConnections().forEach(function (con) {
                        con.removeType('selected');
                        con.endpoints.forEach(function (elem) {
                            elem.removeType('selected');
                        });
                    });
                    ep.connections.forEach(function (con) {
                        con.setType('selected');
                        con.endpoints.forEach(function (epAdjacent) {
                            epAdjacent.setType('selected');
                        });
                    });
                });

            }

            //_addBoardEndpoints
            for (var type in board.pins) {
                board.pins[type].forEach(addEndPoint);
            }
        }

        //Adds a raw svg for a component
        function _loadComponent(DOMComponent, newComponent) {
            var spaceInterPin = {};
            if ((newComponent.manufacturer === 'makeblock') || (newComponent.manufacter === 'makeblock')) {
                spaceInterPin = {
                    blue: {
                        x: 0.5,
                        y: 1
                    },
                    white: {
                        x: 0.5,
                        y: 1
                    },
                    black: {
                        x: 0.5,
                        y: 1
                    },
                    yellow: {
                        x: 0.5,
                        y: 1
                    },
                    wireless: {
                        x: 1,
                        y: 0.5
                    },
                    serial: {
                        x: 1,
                        y: 0.5
                    }
                };
            } else if (newComponent.manufacturer === 'bq-zumjunior') {
                spaceInterPin = {
                    ad: {
                        x: 0.29,
                        y: 1
                    },
                    i2c: {
                        x: 0.29,
                        y: 1
                    }
                };
            } else {
                if (newComponent.pins.digital && newComponent.pins.analog) {
                    spaceInterPin = {
                        digital: {
                            x: newComponent.pins.digital && newComponent.width / (newComponent.pins.digital.length + 1) / newComponent.width,
                            y: 0
                        },
                        analog: {
                            x: newComponent.pins.analog && newComponent.width / (newComponent.pins.analog.length + 1) / newComponent.width,
                            y: 1
                        },
                        'i2c-4': {
                            x: newComponent.pins['i2c-4'] && newComponent.width / (newComponent.pins['i2c-4'].length + newComponent.pins.i2c5.length + 1) / newComponent.width,
                            y: 0
                        },

                        'i2c-5': {
                            x: newComponent.pins['i2c-5'] && (newComponent.width / (newComponent.pins.i2c5.length + newComponent.pins['i2c-4'].length + 1) / newComponent.width) * 2,
                            y: 0
                        },
                        serial: {
                            x: 1,
                            y: 0.5
                        }
                    };
                } else {
                    spaceInterPin = {
                        digital: {
                            x: newComponent.pins.digital && newComponent.width / (newComponent.pins.digital.length + 1) / newComponent.width,
                            y: 1
                        },
                        analog: {
                            x: newComponent.pins.analog && newComponent.width / (newComponent.pins.analog.length + 1) / newComponent.width,
                            y: 0
                        },
                        'i2c-4': {
                            x: newComponent.pins['i2c-4'] && newComponent.width / (newComponent.pins['i2c-4'].length + newComponent.pins['i2c-5'].length + 1) / newComponent.width,
                            y: 0
                        },

                        'i2c-5': {
                            x: newComponent.pins['i2c-5'] && (newComponent.width / (newComponent.pins['i2c-5'].length + newComponent.pins['i2c-4'].length + 1) / newComponent.width) * 2,
                            y: 0
                        },
                        serial: {
                            x: 1,
                            y: 0.5
                        },
                        greymotor: {
                            x: 0.5,
                            y: 1
                        },
                        mkmk: {
                            x: 0.5,
                            y: 0
                        }
                    };
                }
            }

            var mandatoryPins = {};

            function createEndPoint(element, index) {
                var el = element,
                    isMandatoryPin = false;
                if (!newComponent.pin) {
                    newComponent.pin = {};
                }
                if (!(element in newComponent.pin)) {
                    newComponent.pin[element] = null;
                } else {
                    mandatoryPins[type] = mandatoryPins[type] || {};
                    mandatoryPins[type][element] = newComponent.pin[element];
                    isMandatoryPin = true;
                }

                if (typeof element !== 'string') {
                    el = Object.keys(element)[0];
                }
                var anchorValue = [spaceInterPin[type].x * (index + 1), spaceInterPin[type].y, 0, 0, 0, 0];

                if (!newComponent.endpoints) {
                    newComponent.endpoints = {};
                }
                if (!newComponent.endpoints[el]) {
                    newComponent.endpoints[el] = {
                        type: type,
                        uid: jsPlumbUtil.uuid()
                    };
                }

                var epComponent = jsPlumbInstance.addEndpoint(DOMComponent, {
                    // connectionType: 'default',
                    anchor: anchorValue,
                    uuid: newComponent.endpoints[el].uid,
                    parameters: {
                        pinComponent: el,
                        type: type
                    },
                    endpoint: ['Dot', {
                        radius: 7
                    }],
                    isSource: true,
                    isTarget: false,
                    cssClass: 'component_ep pin-' + el,
                    hoverClass: 'component_ep--hover',
                    connectorStyle: {
                        strokeStyle: config.color,
                        fillStyle: 'transparent',
                        lineWidth: 5,
                        joinstyle: 'round',
                        outlineWidth: 1,
                        outlineColor: '#EBEBEB'
                    },
                    connectorHoverStyle: {
                        strokeStyle: config.colorHover
                    }
                }, {
                        scope: type
                    });

                epComponent.canvas.classList.add('selected');

                epComponent.unbind('click');
                epComponent.bind('click', function (ep) {

                    ep.canvas.classList.add('selected');

                    exports.unselectAllConnections();

                    if (ep.hasType('selected')) {
                        return false;
                    }

                    ep.connections.forEach(function (con) {
                        _selectConnection(con);
                    });

                });

                //Connect automaticaly these pins
                if (isMandatoryPin && mandatoryPins[type][element]) {
                    var epBoardReference = _getPinBoardReference('.board_ep-' + type + '.pin-' + mandatoryPins[type][element].toLowerCase()),
                        eqBoardError;

                    if (epBoardReference) {
                        if (epBoardReference.connections.length > 0 && (mandatoryPins[type][element].toLowerCase() === 'a4' || mandatoryPins[type][element].toLowerCase() === 'a5')) {
                            epBoardReference = _getPinBoardReference('.board_ep-' + type + '.pin-' + mandatoryPins[type][element].toLowerCase() + '-h') || epBoardReference;
                        }
                    } else if (board.uuid === 'ArduinoUNO' || board.uuid === 'ArduinoMEGA2560') {
                        epBoardReference = _getPinBoardReference('.board_ep-' + type + '.pin-' + mandatoryPins[type][element].toLowerCase() + '-h');
                    }

                    if (!epBoardReference) {
                        eqBoardError = true;
                        $log.debug('Unable to recover board endpoints');
                    } else {
                        _detachAllByAnalogPin(mandatoryPins[type][element].toLowerCase());
                        var uidEPBoard = epBoardReference.getUuid(),
                            uidEPComponent = epComponent.getUuid();
                        jsPlumbInstance.connect({
                            uuids: [uidEPComponent, uidEPBoard],
                            type: 'automatic'
                        });
                    }

                } else {
                    $log.debug('mandatoryPins. Some reference lost', mandatoryPins);
                }
            }

            for (var type in newComponent.pins) {
                if (newComponent.pins[type]) {
                    newComponent.pins[type].forEach(createEndPoint);
                }
            }

            jsPlumbInstance.draggable(DOMComponent, {
                containment: true
            });
        }

        function _onMouseDownHandler() {

            var comp = this;
            componentDragging = comp;

            exports.unselectAllConnections();

            var connectionsArray = jsPlumbInstance.getConnections().filter(function (el) {
                return el.sourceId === comp.id;
            });

            $('.component_ep').removeClass('selected');
            jsPlumbInstance.selectEndpoints({
                source: this
            }).addClass('selected');

            connectionsArray.forEach(function (c) {
                _selectConnection(c);
            });
        }

        function _onMouseUpHandler() {
            if (componentDragging) {
                //Transforms absolute coordinates to relative coordinates
                componentDragging.style.left = ((componentDragging.offsetLeft * 100) / containerDefault.offsetWidth) + '%';
                componentDragging.style.top = ((componentDragging.offsetTop * 100) / containerDefault.offsetHeight) + '%';
                componentDragging = null;
            }
        }

        function _registerJsPlumbTypes() {

            // Register connection types
            var commonConnectionType = {};

            jsPlumbInstance.registerConnectionTypes({
                'selected': {
                    paintStyle: {
                        strokeStyle: config.colorHover
                    },
                    hoverPaintStyle: {
                        strokeStyle: config.colorHover
                    }
                },
                'default': commonConnectionType
            });

            // Register endpoints types
            jsPlumbInstance.registerEndpointTypes({
                'selected': {
                    paintStyle: {
                        strokeStyle: config.colorHover,
                        fillStyle: config.colorHover
                    },
                    hoverPaintStyle: {
                        fillStyle: config.colorHover
                    }
                }
            });

            jsPlumbInstance.registerEndpointTypes({
                'connected': {
                    paintHoverStyle: {
                        fillStyle: config.colorHover
                    },
                    endpointHoverStyle: {
                        fillStyle: config.colorHover
                    }
                }
            });
        }

        function _selectConnection(element) {
            if (element.hasType('selected')) {
                return false;
            }
            element.setType('selected');
            element.canvas.classList.add('selected');

            element.endpoints.forEach(function (ep) {
                ep.setType('selected');
                ep.canvas.classList.add('selected');
            });
        }

        function _setVisiblePins(type, visible) {
            var pinA4BoardReference = _getPinBoardReference('.board_ep-' + type + '.pin-a4'),
                pinA5BoardReference = _getPinBoardReference('.board_ep-' + type + '.pin-a5');
            if (pinA4BoardReference && pinA5BoardReference) {
                pinA4BoardReference.setVisible(visible);
                pinA5BoardReference.setVisible(visible);
            }
        }

        function _throttle(type, name, obj) {
            obj = obj || $window;
            var running = false;
            var func = function () {
                if (running) {
                    return;
                }
                running = true;
                requestAnimationFrame(function () {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };
            obj.addEventListener(type, func);
        }

        function _unselectConnection(element) {
            element.removeType('selected');

            element.canvas.classList.remove('selected');

            element.endpoints.forEach(function (ep) {
                ep.removeType('selected');
                ep.canvas.classList.remove('selected');
            });
        }

        /* init - you can init any event */
        _throttle('resize', 'optimizedResize');

        return exports;

    });
