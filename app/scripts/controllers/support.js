'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular
    .module('bitbloqApp')
    .controller('SupportCtrl', function (
        $translate,
        $scope,
        $location,
        $routeParams,
        $http,
        $sce,
        $rootScope,
        $window,
        $log,
        common,
        _,
        userApi,
        feedbackApi,
        alertsService,
        web2boardOnline,
        chromeAppApi,
        hardwareService,
        utils,
        ngDialog,
        supportApi,
        $q
    ) {
        $scope.translate = $translate;
        var sessionStorage = $window.sessionStorage

        $scope.goBack = function () {
            $window.history.back();
        };

        // switches
        common.itsUserLoaded().then(function () {
            $scope.user = common.user;
            $scope.switchUserChromeAppMode = function () {
                userApi.update({
                    chromeapp: common.user.chromeapp
                });
            };
        });

        // lists

        $scope.getSVG = function (item) {
            if (item.svg === '') {
                $http.get($scope.setTimestampToURL('images/components/', item.uuid + '.svg'))
                      .then(function (res) {
                        //we want to delete all height and width atributes form the original svg files
                          item.svg = _.replace(
                              res.data,
                              /\b(width|height)="+[a-zA-Z1-9]+" ?\b/gi,
                              ''
                          );
                      });
            }
        };

        $scope.renderSVG = function (item) {
            return $sce.trustAsHtml(item.svg); // all of this for the svg animations to fly! :)
        };

        // imgModal

        $scope.imgModal = function (img) {
            var parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                contentHTML: '<div><img src="' + img + '" /></div>'
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container',
                scope: modalOptions
            });
        };

        // hw test
        $scope.hwTestTries = 0;
        $scope.hwTestStart = function (component, board) {
            switch (component) {
                case 'led':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: $scope.card.data.scope.programHex.bt328
                            })
                            .then(function () {
                                $scope.go('hardLEDsTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: $scope.card.data.scope.programHex.uno
                            })
                            .then(function () {
                                $scope.go('hardLEDsTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'buzz':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: $scope.card.data.scope.programHex.bt328
                            })
                            .then(function () {
                                $scope.go('hardBuzzTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: $scope.card.data.scope.programHex.uno
                            })
                            .then(function () {
                                $scope.go('hardBuzzTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'lcd':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: $scope.card.data.scope.programHex.bt328
                            })
                            .then(function () {
                                $scope.go('hardLCDsTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: $scope.card.data.scope.programHex.uno
                            })
                            .then(function () {
                                $scope.go('hardLCDsTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'us':
                case 'us3':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: $scope.card.data.scope.programHex.bt328
                            })
                            .then(function () {
                                $scope.go('hardUSTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: $scope.card.data.scope.programHex.uno
                            })
                            .then(function () {
                                $scope.go('hardUSTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
                case 'button':
                    if (board === 'bqzum') {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'bt328'
                                },
                                hex: $scope.card.data.scope.programHex.bt328
                            })
                            .then(function () {
                                $scope.go('hardButtonTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('form', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    } else {
                        web2boardOnline
                            .upload({
                                board: {
                                    mcu: 'uno'
                                },
                                hex: $scope.card.data.scope.programHex.uno
                            })
                            .then(function () {
                                $scope.go('hardButtonTestEnd', true);
                            })
                            .catch(function () {
                                if ($scope.hwTestTries > 2) {
                                    $scope.go('hard2forum', true);
                                } else {
                                    $scope.hwTestTries++;
                                }
                            });
                    }
                    break;
            }
        };

        $scope.boards = [];
        $scope.getBoards = function () {
            //then lets load the ports
            chromeAppApi
                .getPorts()
                .then(function (response) {
                    $scope.ports = filterPortsByOS(response.ports);
                    hardwareService.itsHardwareLoaded().then(function () {
                        utils.getPortsPrettyNames(
                            $scope.ports,
                            hardwareService.hardware.boards
                        );
                        $scope.portNames = [];

                        for (var i = 0; i < $scope.ports.length; i++) {
                            $scope.portNames.push($scope.ports[i].portName);
                        }

                        $scope.boards = $scope.portNames;
                    });
                })
                .catch(function (error) {
                    console.log('error SerialMonitorCtrl', error);
                });
        };

        // dc function to free the serial port
        $scope.dc = function () {
            chromeAppApi.stopSerialCommunication();
            if (serialEvent) {
                serialEvent();
            }
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
        $scope.selected = false;
        $scope.selectBoardUS = function (item) {
            $scope.selected = true;
            var port = _.find($scope.ports, {
                portName: item
            });
            $scope.selectedPort = port;
            chromeAppApi.getSerialData($scope.selectedPort);
            serialEvent = $rootScope.$on('serial', function (event, msg) {
                // maybe we recieve more than one metric on the same package
                var piece = msg.split(/\s+/)[0].slice(0, -3);

                if (piece.length === 1) {
                    piece = '00' + piece;
                } else if (piece.length === 2) {
                    piece = '0' + piece;
                } else if (piece.length > 3) {
                    piece = '---';
                }

                $scope.serialMsg = $sce.trustAsHtml(
                    '<span>' +
                    (piece + 'cm').split(/(?!^)/).join('</span><span>') +
                    '</span>'
                );
                utils.apply($scope);
            });
        };

        $scope.serialMsg =
            '<span>-</span><span>-</span><span>-</span><span>c</span><span>m</span>'; // default
        var serialEvent = null;

        // form + '|' + piece[1]
        $scope.response = {
            message: '',
            // 'code': '',
            error: '',
            system: '',
            antivirus: '',
            linklog: '',
            w2blog: ''
        };
        // sometimes the user go back and forth...
        // lets clean the steps!
        $scope.getSteps = function () {
            // only if we donesn't want duplicates
            // common.supportSteps = _.uniqBy(
            //     common.supportSteps.reverse()
            // ).reverse();
            return common.supportSteps.join('</li><li>');
        };
        $scope.sendIsBlocked = false;
        $scope.send = function () {
            var str = '';
            $scope.sendIsBlocked = true;
            // message
            // /r/n -> <br />
            if ($scope.response.message.length > 0) {
                str += '<div><pre>';
                str += unHTMLfy($scope.response.message);
                str += '</pre></div>';
            }
            // code
            // if ($scope.response.code.length > 0) {
            //   str += '<br><hr><strong>Código:</strong><br>'
            //   str += '<div style="border: 1px dashed #1B6D33; padding: 5px; margin: 5px;"><pre>'
            //   str += unHTMLfy($scope.response.code)
            //   str += '</pre></div>'
            // }
            // error
            if ($scope.response.error.length > 0) {
                str += '<br><hr><strong>Error:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.error);
                str += '</pre></div>';
            }
            // system
            if ($scope.response.system.length > 0) {
                str += '<p><strong>Sistema Operativo: </strong><pre>';
                str += unHTMLfy($scope.response.system);
                str += '</pre></p>';
            }
            // antivirus
            if ($scope.response.antivirus.length > 0) {
                str += '<p><strong>Antivirus: </strong><pre>';
                str += unHTMLfy($scope.response.antivirus);
                str += '</pre></p>';
            }
            // linklog
            if ($scope.response.linklog.length > 0) {
                str += '<br><hr><strong>web2boardLink.log:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.linklog);
                str += '</pre></div>';
            }
            // w2blog
            if ($scope.response.w2blog.length > 0) {
                str += '<br><hr><strong>web2board/info.log:</strong><br>';
                str +=
                    '<div style="border: 1px dashed #B8282A; padding: 5px; margin: 5px;"><pre>';
                str += unHTMLfy($scope.response.w2blog);
                str += '</pre></div>';
            }
            // adding steps list
            str += '<br><hr><strong>Camino:</strong><br><ol><li>';
            str += $scope.getSteps();
            str += '</li></ol>';

            var res = {
                creator: common.user,
                message: str,
                userAgent: window.navigator.userAgent
            };

            feedbackApi
                .send(res)
                .success(function () {
                    alertsService.add({
                        text: 'modal-comments-done',
                        id: 'modal-comments',
                        type: 'ok',
                        time: 5000
                    });
                    $scope.sendIsBlocked = false;
                    $scope.go('end', true)
                })
                .error(function () {
                    alertsService.add({
                        text: 'modal-comments-error',
                        id: 'modal-comments',
                        type: 'warning'
                    });
                    $scope.sendIsBlocked = false;
                });
        };

        var unHTMLfy = function (str) {
            return str
                .replace(/(?:&)/g, '&amp;')
                .replace(/(?:<)/g, '&lt;')
                .replace(/(?:>)/g, '&gt;')
                .replace(/\u00a0/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/(?:\r\n|\r|\n)/g, '<br />');
        };

        /****************************
         ******PRIVATE FUNCTIONS******
         *****************************/
        var isPermalink = $location.path().indexOf('/support/p/') !== -1
        var id = $routeParams.id
        $scope.card = null
        var cards = []

        function _init() {
            if (id) {
                getFromSS(id, isPermalink).then(function (item) {
                    if (item) {
                        $scope.card = item
                    } else {
                        $location.path('/support/p/404');
                    }
                });
            } else {
                getFromSS('index', true).then(function (item) {
                    if (item) {
                        $scope.card = item
                    } else {
                        $location.path('/support/p/index');
                    }
                });
            }
        }

        function getFromSS(id, isPermalink) {
            var item = null
            if (sessionStorage.supportCards) {
                cards = JSON.parse(sessionStorage.supportCards);
                item = cards.filter(function (item) {
                    return ((isPermalink) ? item.permalink : item._id) === id;
                })
            }
            var defered = $q.defer();
            // is in ss?
            if (item && item.length) {
                defered.resolve(item[0]);
            } else {
                // if not, load from api and push to ss
                supportApi.getId(id, isPermalink)
                    .then(
                    function (res) {
                        item = res.data[0];
                        saveStep(item.permalink);
                        cards.push(item);
                        sessionStorage.setItem('supportCards', JSON.stringify(cards));
                        defered.resolve(item);
                    },
                    function () {
                        // if doesn't exists, return 404
                        var exit404 = false
                        if (!exit404) {
                            exit404 = true;
                            getFromSS('404', true)
                                .then(
                                function (item) {
                                    defered.resolve(item)
                                },
                                function () {
                                    defered.reject()
                                });
                        }
                    })
            }
            return defered.promise;
        }

        function saveStep(permalink) {
            if (_.last(common.supportSteps) !== permalink &&
                permalink !== 'index') {
                common.supportSteps.push(permalink);
            }
        }

        $scope.go = function (permalink) {
            if (permalink === 'index') {
                $location.path('/support/');
            } else {
                getFromSS(permalink, true).then(function (item) {
                    if (item) {
                        $location.path('/support/' + item._id);
                    } else {
                        $log.log(permalink + ' -> 404');
                        $location.path('/support/p/404');
                    }
                })
            }
        };

        $scope.setTimestampToURL = function (pre, post) {
          return pre + utils.getTimestampPrefix() + post;
        };


        $window.onbeforeunload = $scope.dc();
        $scope.$on('$destroy', function () {
            $scope.dc();
        });

        _init();
    });
