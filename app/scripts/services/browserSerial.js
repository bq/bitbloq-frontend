"use strict";

/**
 * @ngdoc service
 * @name bitbloqApp.browserSerial
 * @description
 * # Browser serial port management
 * Service in the bitbloqApp.
 */
angular
    .module("bitbloqApp")
    .service("browserSerial", function(borndate, $rootScope, $q) {
        var exports = {
            connect: connect,
            sendSerialData: sendSerialData,
            close: close
        };

        var port;
        var reader;
        var writer;

        function connect(board, baudrate) {
            var boardConfig = borndate.knownBoards[board.mcu];
            var portDefer = $q.defer();

            navigator.serial.getPorts().then(function(ports) {
                if (ports && ports.length) {
                    portDefer.resolve(ports[0]);
                } else {
                    navigator.serial
                        .requestPort({
                            filters: [
                                {
                                    usbVendorId: boardConfig.vendorId,
                                    usbProductId: boardConfig.productId
                                }
                            ]
                        })
                        .then(portDefer.resolve);
                }
            });

            portDefer.promise
                .then(function(p) {
                    port = p;
                    return port.open({ baudrate: baudrate });
                })
                .then(function() {
                    var decoder = new TextDecoderStream();
                    port.readable.pipeTo(decoder.writable).catch(function() {});
                    reader = decoder.readable.getReader();

                    reader.read().then(function processText(args) {
                        if (args.done) {
                            return;
                        }
                        $rootScope.$emit("serial", args.value);
                        return reader.read().then(processText);
                    });

                    const encoder = new TextEncoderStream();
                    encoder.readable.pipeTo(port.writable);
                    writer = encoder.writable.getWriter();
                });
        }

        function sendSerialData(data) {
            writer.write(data);
        }

        function close() {
            var readerDefer = $q.defer();
            var writerDefer = $q.defer();
            var portDefer = $q.defer();

            reader.cancel().then(function() {
                reader = null;
                readerDefer.resolve();
            });
            writer.close().then(function() {
                writer = null;
                writerDefer.resolve();
            });

            $q.all([readerDefer.promise, writerDefer.promise])
                .then(function() {
                    return port.close();
                })
                .then(function() {
                    port = null;
                    portDefer.resolve();
                });

            return portDefer.promise;
        }

        return exports;
    });
