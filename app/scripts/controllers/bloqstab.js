'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqstabCtrl
 * @description
 * # BloqstabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('BloqstabCtrl', function($rootScope, $scope, $timeout, $translate, $window, common, bloqsUtils,
        bloqs, bloqsApi, $http, envData, $log, $document, _, ngDialog, $location, userApi, alertsService, web2board,
        robotFirmwareApi, web2boardOnline) {

        $scope.goToCodeModal = function() {
            $scope.common.session.bloqTab = true;
            if ($scope.common.session.save) {
                $scope.project.code = $scope.code;
            }
            if (!$scope.common.user || !$scope.common.user.hasBeenWarnedAboutChangeBloqsToCode) {
                var modalCode = $rootScope.$new();
                _.extend(modalCode, {
                    contentTemplate: '/views/modals/alert.html',
                    text: 'code-modal_text_info',
                    cancelButton: true,
                    confirmText: 'code-modal_button_confirm',
                    confirmAction: goToCode,
                    cancelText: 'code-modal_button_reject',
                    rejectAction: goToBloq
                });
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container code-modal modal--alert',
                    scope: modalCode,
                    showClose: false
                });
            } else {
                if ($scope.project._id) {
                    $location.path('/codeproject/' + $scope.project._id);
                } else {
                    $scope.common.session.project = $scope.project;
                    $scope.common.session.project.codeProject = true;
                    $location.path('/codeproject/');
                }
            }
        };

        $scope.onFieldKeyDown = function(event) {
            if ((event.keyCode === 8) && $document[0].activeElement.attributes['data-bloq-id']) {
                event.preventDefault();
                var bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
                    bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
                    $scope.$field.focus();
                    $scope.saveBloqStep();
                    $scope.startAutosave();
                } else {
                    $log.debug('we cant delete group bloqs');
                }

            }
        };

        $scope.onFieldKeyUp = function(event) {
            //$log.debug('event.keyCode', event.keyCode);
            var bloq;

            switch (event.keyCode) {
                case 46:
                case 8:
                    if ($document[0].activeElement.attributes['data-bloq-id']) {
                        event.preventDefault();
                        bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                        if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
                            bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
                            $scope.$field.focus();
                            $scope.saveBloqStep();
                            $scope.startAutosave();
                        } else {
                            $log.debug('we cant delete group bloqs');
                        }
                    }
                    break;
                case 67:
                    //$log.debug('ctrl + c');
                    if (event.ctrlKey && $document[0].activeElement.attributes['data-bloq-id']) {
                        bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                        var position = bloq.$bloq[0].getBoundingClientRect();
                        if (bloq.bloqData.type !== 'group') {
                            localStorage.bloqInClipboard = angular.toJson({
                                structure: bloq.getBloqsStructure(),
                                top: position.top,
                                left: position.left
                            });
                        }
                    }
                    break;
                case 86:
                    //$log.debug('ctrl + v');
                    if (event.ctrlKey && localStorage.bloqInClipboard) {
                        copyBloq(JSON.parse(localStorage.bloqInClipboard));
                    }
                    break;
                case 89:
                    $log.debug('ctrl + y');
                    if (event.ctrlKey) {
                        $scope.redo();
                        $window.document.getElementById('bloqs--field').focus();
                    }
                    break;
                case 90:
                    $log.debug('ctrl + z');
                    if (event.ctrlKey) {
                        $scope.undo();
                        $window.document.getElementById('bloqs--field').focus();
                    }
                    break;
            }

        };

        $scope.init = function() {
            if ($scope.bloqs.varsBloq) {
                bloqs.removeBloq($scope.bloqs.varsBloq.uuid, true);
                $scope.bloqs.varsBloq = null;
                bloqs.removeBloq($scope.bloqs.setupBloq.uuid, true);
                $scope.bloqs.setupBloq = null;
                bloqs.removeBloq($scope.bloqs.loopBloq.uuid, true);
                $scope.bloqs.loopBloq = null;
            }

            $scope.bloqs.varsBloq = bloqs.buildBloqWithContent($scope.project.software.vars, $scope.componentsArray, bloqsApi.schemas, $scope.$field);
            $scope.bloqs.setupBloq = bloqs.buildBloqWithContent($scope.project.software.setup, $scope.componentsArray, bloqsApi.schemas);
            $scope.bloqs.loopBloq = bloqs.buildBloqWithContent($scope.project.software.loop, $scope.componentsArray, bloqsApi.schemas);

            $scope.$field.append($scope.bloqs.varsBloq.$bloq, $scope.bloqs.setupBloq.$bloq, $scope.bloqs.loopBloq.$bloq);
            $scope.bloqs.varsBloq.enable(true);
            $scope.bloqs.varsBloq.doConnectable();

            $scope.bloqs.setupBloq.enable(true);
            $scope.bloqs.setupBloq.doConnectable();

            $scope.bloqs.loopBloq.enable(true);
            $scope.bloqs.loopBloq.doConnectable();

            bloqs.updateDropdowns();
        };

        $scope.initFreeBloqs = function() {
            var tempBloq, i, j,
                lastBottomConnector;

            bloqs.destroyFreeBloqs();
            if ($scope.project.software.freeBloqs && ($scope.project.software.freeBloqs.length > 0)) {
                for (i = 0; i < $scope.project.software.freeBloqs.length; i++) {
                    lastBottomConnector = null;
                    for (j = 0; j < $scope.project.software.freeBloqs[i].bloqGroup.length; j++) {
                        // $log.debug($scope.project.software.freeBloqs[i].bloqGroup[j]);
                        tempBloq = bloqs.buildBloqWithContent($scope.project.software.freeBloqs[i].bloqGroup[j], $scope.componentsArray, bloqsApi.schemas);

                        if (lastBottomConnector) {
                            bloqs.connectors[lastBottomConnector].connectedTo = tempBloq.connectors[0];
                            bloqs.connectors[tempBloq.connectors[0]].connectedTo = lastBottomConnector;

                        } else {
                            tempBloq.$bloq[0].style.transform = 'translate(' + $scope.project.software.freeBloqs[i].position.left + 'px,' + $scope.project.software.freeBloqs[i].position.top + 'px)';
                        }

                        lastBottomConnector = tempBloq.connectors[1];

                        $scope.$field.append(tempBloq.$bloq);
                        tempBloq.disable();
                        tempBloq.doConnectable();
                    }

                    bloqsUtils.redrawTree(tempBloq, bloqs.bloqs, bloqs.connectors);
                }
            }
            bloqsUtils.drawTree(bloqs.bloqs, bloqs.connectors);
        };

        $scope.showComponents = function(item) {
            var stopWord = ['analogWrite', 'digitalWrite', 'pinReadAdvanced', 'pinWriteAdvanced', 'turnOnOffAdvanced', 'digitalReadAdvanced', 'analogReadAdvanced', 'pinLevels'];
            if (stopWord.indexOf(item) === -1) {
                var result = false;
                if ($scope.componentsArray.robot.length === 0) {
                    var userComponents = _.keys(_.pick($scope.componentsArray, function(value) {
                        return value.length > 0;
                    }));
                    if (item === 'hwVariable' && userComponents.length !== 0) {
                        result = true;
                    } else {
                        userComponents.forEach(function(value) {
                            if (item.indexOf('serial') > -1) {
                                result = $scope.showCommunications(item);
                            } else {
                                if (value[value.length - 1] === 's') {
                                    value = value.substring(0, value.length - 1);
                                }
                                if (value === 'servo') {
                                    value = 'servoNormal';
                                }
                                item = item.toUpperCase();
                                value = value.toUpperCase();
                                value = value.toUpperCase();
                                if (item.includes('RGBLED')) {
                                    if (value.includes('RGB')) {
                                        result = true;
                                    }
                                } else if ((value.includes('SERVO') || value === 'OSCILLATOR') && (item === 'SERVOATTACH' || item === 'SERVODETACH')) {
                                    result = true;
                                } else if (item.includes(value) || value.includes(item)) {
                                    result = true;
                                }
                            }
                        });
                    }
                }
                return result;
            } else {
                return true;
            }
        };

        $scope.showCommunications = function(item) {
            var stopWord = ['convert'];
            if ($scope.componentsArray.serialElements) {
                return !(stopWord.indexOf(item) === -1 && $scope.componentsArray.serialElements.length === 0);
            } else {
                return false;
            }
        };

        $scope.searchBloq = function() {
            var userComponents = _.pick($scope.componentsArray, function(value) {
                return value.length > 0;
            });
            if (userComponents.indexOf($scope.searchText)) {
                //Todo pintar en un contenedor nuevo
            }
        };

        var contextMenuDocumentHandler = function(event) {

            var bloq = $(event.target).closest('.bloq');
            var bloqUuid = bloq.attr('data-bloq-id');

            if (bloqUuid && !bloq.hasClass('bloq--group') && bloqs.bloqs[bloqUuid].isConnectable()) {
                event.preventDefault();
                $scope.$apply(function() {
                    $scope.contextMenuBloq = bloqs.bloqs[bloqUuid];
                });
                if ((angular.element($window).height() - event.pageY) > $contextMenu.height()) {
                    $contextMenu.css({
                        display: 'block',
                        left: event.pageX + 'px',
                        top: event.pageY + 'px'
                    });
                } else {
                    $contextMenu.css({
                        display: 'block',
                        left: event.pageX + 'px',
                        top: (event.pageY - $contextMenu.height()) + 'px'
                    });
                }

            } else {
                $contextMenu.css({
                    display: 'none'
                });
            }
        };

        var clickDocumentHandler = function() {
            $contextMenu.css({
                display: 'none'
            });
        };

        $scope.enableBloqFromContextMenu = function(bloq) {
            bloq.enable();
            $scope.saveBloqStep();
            $scope.startAutosave();
        };
        $scope.disableBloqFromContextMenu = function(bloq) {
            bloq.disable();
            $scope.saveBloqStep();
            $scope.startAutosave();
        };
        $scope.removeBloqFromContextMenu = function(bloq) {
            bloqs.removeBloq(bloq.uuid, true);
            //saveBloqStep from here to not listen remove event from children and store one step for children
            $scope.saveBloqStep();
            $scope.startAutosave();
        };

        $scope.duplicateBloqFromContextMenu = function(bloq) {
            var position = bloq.$bloq[0].getBoundingClientRect();
            copyBloq({
                structure: bloq.getBloqsStructure(),
                top: position.top,
                left: position.left
            });
        };

        $scope.setSoftwareTab = function(tab) {
            $scope.softTab = tab;
            if (tab === 'code') {
                $scope.setCode(bloqsUtils.getCode($scope.componentsArray, $scope.bloqs));
            } else if (tab === 'bloqs') {
                $rootScope.$emit('currenttab:bloqstab');
            }
        };

        $scope.hideBloqsMenu = function($event) {
            if (!$event.target.className.match('btn--advanced') && !$event.target.className.match('level--2--shadow') && !$event.target.className.match('toolbox--bloqs--container')) {
                $scope.toolbox.level = 1;
            }
        };

        $scope.performFactoryReset = function() {
            var robot = $scope.project.hardware.robot,
                version = common.properties.robotsFirmwareVersion[robot];
            robotFirmwareApi.getFirmware(robot, version).then(function(result) {
                if (common.os === 'ChromeOS') {
                    web2boardOnline.upload({
                        hex: result.data,
                        board: {
                            mcu: 'uno'
                        }
                    });
                } else {
                    web2board.uploadHex('uno', result.data);
                }
            }, function() {
                // alert("Error"); todo: add toast
            });
        };

        function checkInputLength() {
            setScrollsDimension();
        }

        function copyBloq(bloq) {

            var newBloq = bloqs.buildBloqWithContent(bloq.structure, $scope.componentsArray, bloqsApi.schemas);

            newBloq.doConnectable();
            newBloq.disable();

            newBloq.$bloq[0].style.transform = 'translate(' + (bloq.left - 50 + $scope.$field.scrollLeft()) + 'px,' + (bloq.top - 100 + $scope.$field.scrollTop()) + 'px)';
            $scope.$field.append(newBloq.$bloq);
            $scope.saveBloqStep();
            var i = 0;
            if (newBloq.varInputs) {
                for (i = 0; i < newBloq.varInputs.length; i++) {
                    newBloq.varInputs[i].keyup();
                }
            }
        }

        function scrollField(e) {
            scrollBar.css('height', e.currentTarget.scrollHeight);
            scrollBarContainer.scrollTo(0, e.currentTarget.scrollTop);
            field.scrollTo(0, scrollBarContainer[0].scrollTop);
        }

        function scrollHorizontalField(e) {
            if ($scope.lastPosition > e.currentTarget.scrollLeft) {
                angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft);
            } else {
                angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft + 150);
            }
            $scope.lastPosition = e.currentTarget.scrollLeft;
        }

        function setScrollWidth() {
            $timeout(function() {
                var groupBloqs = angular.element('.field--content');
                var horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
                var horizontalScrollWidth = Math.max.apply(null, groupBloqs.map(function() {
                    return this.scrollWidth;
                }));
                if (horizontalScrollWidth > groupBloqs[0].clientWidth) {
                    $scope.showHorizontalScroll = true;
                    horizontalScrollBar.css('width', horizontalScrollWidth + 50);
                } else {
                    $scope.showHorizontalScroll = false;
                }
            }, 50);
        }

        function setScrollHeight() {
            $timeout(function() {
                var realScrollbarHeight = bloqsTab.height() + 50;

                if ($scope.$field.height() < realScrollbarHeight) {
                    $scope.showScroll = true;
                    scrollBar.css('height', field[0].scrollHeight);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else {
                    $scope.showScroll = false;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            }, 50);
        }

        function goToCode() {
            ngDialog.closeAll();
            if ($scope.common.user) {
                $scope.common.user.hasBeenWarnedAboutChangeBloqsToCode = true;
                userApi.update({
                    hasBeenWarnedAboutChangeBloqsToCode: true
                });
                if ($scope.project._id) {
                    $scope.saveProject().then(function() {
                        $location.path('/codeproject/' + $scope.project._id);
                    });
                } else {
                    $location.path('/codeproject/');
                }
            } else {
                $scope.common.session.project = $scope.project;
                $scope.common.session.project.codeProject = true;
                $location.path('/codeproject/');
            }
        }

        function goToBloq() {
            ngDialog.closeAll();
            $scope.setSoftwareTab('bloqs');
        }

        function setScrollsDimension() {
            if (!$scope.common.isLoading) {
                setScrollHeight();
                setScrollWidth();
            } else {
                $timeout(function() {
                    setScrollsDimension();
                }, 200);
            }
        }

        var $contextMenu = $('#bloqs-context-menu'),
            field = angular.element('#bloqs--field'),
            scrollBarContainer = angular.element('.make--scrollbar'),
            scrollBar = angular.element('.scrollbar--small'),
            bloqsTab = angular.element('.bloqs-tab');

        $scope.lastPosition = 0;
        $scope.$field = $('#bloqs--field').last();

        $scope.bloqsApi = bloqsApi;

        var bloqsLoadTimes = 0;

        function loadBloqs() {
            bloqsLoadTimes++;
            bloqsApi.itsLoaded().then(function() {
                    $scope.groupBloqs = angular.element('.field--content');
                    $scope.groupBloqs.on('scroll', scrollHorizontalField);
                    $scope.horizontalScrollBarContainer = angular.element('#make--horizontal-scrollbar');
                    $scope.horizontalScrollBarContainer.on('scroll', scrollHorizontalField);
                    $scope.horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
                    $scope.common.isLoading = false;
                    $scope.init();
                    setScrollsDimension();
                    $('input[type="text"]').on('keyup paste change', checkInputLength);
                    bloqs.translateBloqs($translate.use());
                    $scope.$watch('project.software', function(newValue) {
                        var actualProjectSoftware = {
                            vars: $scope.bloqs.varsBloq.getBloqsStructure(),
                            setup: $scope.bloqs.setupBloq.getBloqsStructure(),
                            loop: $scope.bloqs.loopBloq.getBloqsStructure(),
                            freeBloqs: bloqs.getFreeBloqs() || []
                        };
                        $log.debug('Ha cambiado el proyecto', newValue, actualProjectSoftware);
                        if (!angular.equals(newValue, actualProjectSoftware)) {
                            $log.debug(angular.equals(newValue.vars, actualProjectSoftware.vars));
                            $log.debug(angular.equals(newValue.loop, actualProjectSoftware.loop));
                            $log.debug(angular.equals(newValue.setup, actualProjectSoftware.setup));
                            $log.debug(angular.equals(newValue.freeBloqs, actualProjectSoftware.freeBloqs));

                            $log.debug('Repintamos');
                            $scope.init();
                            $scope.initFreeBloqs();
                        } else {
                            $log.debug('NO Repintamos');
                        }
                    });

                    $rootScope.$on('$translateChangeStart', function(evt, key) {
                        bloqs.translateBloqs(key.language);
                    });
                },
                function() {
                    $log.debug('fail');
                    if (bloqsLoadTimes < 2) {
                        loadBloqs();
                    } else {
                        alertsService.add({
                            text: 'make_infoError_bloqsLoadError',
                            id: 'loadBloqs',
                            type: 'warning'
                        });
                    }
                });
        }

        loadBloqs();

        $document.on('contextmenu', contextMenuDocumentHandler);
        $document.on('click', clickDocumentHandler);

        $scope.$on('$destroy', function() {
            $document.off('contextmenu', contextMenuDocumentHandler);
            $document.off('click', clickDocumentHandler);
        });

        $window.onresize = function() {
            $timeout(function() {
                setScrollsDimension();
            }, 10);
        };

        $rootScope.$on('currenttab:bloqstab', function() {
            $timeout(function() {
                setScrollsDimension();
            }, 0);
        });
        $scope.$field.on('scroll', scrollField);
        scrollBarContainer.on('scroll', _.throttle(scrollField, 250));
        $window.addEventListener('bloqs:bloqremoved', _.throttle(setScrollsDimension, 250));
        $window.addEventListener('bloqs:dragend', _.throttle(setScrollsDimension, 1000));

    });