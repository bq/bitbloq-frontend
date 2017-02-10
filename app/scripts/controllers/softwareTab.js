'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SoftwareTabCtrl
 * @description
 * # SoftwareTabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SoftwareTabCtrl', function($rootScope, $scope, $timeout, $translate, $window, bloqsUtils, bloqs, bloqsApi,
                                            $log, $document, _, ngDialog, $location, userApi, alertsService, web2board, robotFirmwareApi, web2boardOnline, projectService,
                                            utils)
    {

        var $contextMenu = $('#bloqs-context-menu'),
            field = angular.element('#bloqs--field'),
            scrollBarContainer = angular.element('.make--scrollbar'),
            scrollBar = angular.element('.scrollbar--small'),
            bloqsTab = angular.element('.bloqs-tab'),
            currentProjectService = $scope.currentProjectService || projectService;

        var bloqsLoadTimes = 0,
            translateChangeStartEvent,
            bloqsTabsEvent;

        $scope.bloqsApi = bloqsApi;
        $scope.currentProject = $scope.currentProject || projectService.project;
        $scope.lastPosition = 0;
        $scope.checkBasicTab = 0;
        $scope.checkAdvanceTab = 0;
        // $scope.functionsCheckCounter = 0;
        $scope.selectedBloqsToolbox = '';
        $scope.twitterSettings = false;

        $scope.showTrashcan = false;
        $scope.$field = $('#bloqs--field').last();

        $scope.$trashcan = null;


        /***********************************
         ***********************************
         *  Indeterminate checkbox functions
         ***********************************
         ***********************************/

        $scope.addChecks = function(type, value, bloqName) {
            $scope.currentProject.selectedBloqs[type] = $scope.currentProject.selectedBloqs[type] || [];
            switch (bloqName) {
                case 'all':
                    _.forEach($scope.common.properties.bloqsSortTree[type], function(item) {
                        if ($scope.currentProject.selectedBloqs[type].indexOf(item.name) === -1) {
                            $scope.currentProject.selectedBloqs[type].push(item.name);
                        }
                    });
                    break;
                case 'any':
                    $scope.currentProject.selectedBloqs[type].splice(0, $scope.currentProject.selectedBloqs[type].length);
                    break;
                default:
                    var indexBloq = $scope.currentProject.selectedBloqs[type].indexOf(bloqName);
                    if (value) {
                        if (indexBloq === -1) {
                            $scope.currentProject.selectedBloqs[type].push(bloqName);
                        }
                    } else {
                        if (indexBloq > -1) {
                            $scope.currentProject.selectedBloqs[type].splice(indexBloq, 1);
                        }
                    }
            }
            var isAdvance = type.indexOf('advance') > -1;
            if ($scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
                if (isAdvance) {
                    $scope.checkAdvanceTab = 'full';
                } else {
                    $scope.checkBasicTab = 'full';
                }
                if ($scope.checkAdvanceTab === 'full' && $scope.checkBasicTab === 'full') {
                    $scope.checkFunction = 'full';
                }
            } else {
                if (isAdvance) {
                    $scope.checkAdvanceTab = $scope.currentProject.selectedBloqs[type].length;
                    $scope.checkFunction = $scope.checkAdvanceTab + $scope.checkBasicTab;
                } else {
                    $scope.checkBasicTab = $scope.currentProject.selectedBloqs[type].length;
                    $scope.checkFunction = $scope.checkBasicTab;
                }
            }
            currentProjectService.startAutosave();
            utils.apply($scope);
        };

        $scope.statusGeneralCheck = function(type, counter) {
            if ($scope.currentProject.selectedBloqs) {
                var newcheckBasicTab = $scope.currentProject.selectedBloqs[type] ? $scope.currentProject.selectedBloqs[type].length : 0,
                    advancedType = 'advanced' + type.charAt(0).toUpperCase() + type.slice(1),
                    newcheckAdvanceTab = $scope.currentProject.selectedBloqs[advancedType] ? $scope.currentProject.selectedBloqs[advancedType].length : 0;
                if (counter || counter === 0) {
                    if (newcheckBasicTab !== 0 && $scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
                        //basic tab is full
                        if (!$scope.currentProject.selectedBloqs[advancedType] || (newcheckAdvanceTab !== 0 && $scope.currentProject.selectedBloqs[advancedType].length === $scope.common.properties.bloqsSortTree[advancedType].length)) {
                            //advanced tab is full
                            counter = counter === 'full' ? 'complete' : 'full';
                        } else {
                            counter = newcheckBasicTab + (typeof newcheckAdvanceTab === 'number' ? newcheckAdvanceTab : 0);
                        }
                    } else {
                        counter = newcheckBasicTab + (typeof newcheckAdvanceTab === 'number' ? newcheckAdvanceTab : 0);
                    }
                } else {
                    if (newcheckBasicTab !== 0 && $scope.currentProject.selectedBloqs[type].length === $scope.common.properties.bloqsSortTree[type].length) {
                        $scope.checkBasicTab = $scope.checkBasicTab === 'full' ? 'complete' : 'full';

                    } else {
                        $scope.checkBasicTab = newcheckBasicTab;
                    }
                    if (newcheckAdvanceTab !== 0 && $scope.currentProject.selectedBloqs[advancedType].length === $scope.common.properties.bloqsSortTree[advancedType].length) {
                        $scope.checkAdvanceTab = $scope.checkAdvanceTab === 'full' ? 'complete' : 'full';
                    } else {
                        $scope.checkAdvanceTab = newcheckAdvanceTab;
                    }
                }
            }
            return counter;
        };

        /***********************************
         end indeterminate checkbox
         ***********************************/



        $scope.changeBloqsToolbox = function(tab) {
            $scope.selectedBloqsToolbox = tab;
        };

        $scope.duplicateBloqFromContextMenu = function(bloq) {
            var position = bloq.$bloq[0].getBoundingClientRect();
            copyBloq({
                structure: bloq.getBloqsStructure(),
                top: position.top,
                left: position.left
            });
        };

        $scope.enableBloqFromContextMenu = function(bloq) {
            bloq.enable();
            $scope.saveBloqStep();
            currentProjectService.startAutosave();
        };
        $scope.disableBloqFromContextMenu = function(bloq) {
            bloq.disable();
            $scope.saveBloqStep();
            currentProjectService.startAutosave();
        };

        $scope.goToCodeModal = function() {
            $scope.common.session.bloqTab = true;
            if ($scope.common.session.save) {
                $scope.currentProject.code = $scope.code;
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
                    scope: modalCode
                });
            } else {
                if ($scope.currentProject._id) {
                    $location.path('/codeproject/' + $scope.currentProject._id);
                } else {
                    $scope.common.session.project = $scope.currentProject;
                    $location.path('/codeproject/');
                }
            }
        };

        $scope.hideBloqsMenu = function($event) {
            var current = $event.target.className;
            if (typeof current === 'object') { //svg
                current = $event.target.parentElement.parentElement.className;
            }
            if (!current.match('toolbox--bloqs--container') && !current.match('element-toolbox') && !current.match('submenu__item') && !current.match('tabs__header__item--vertical')) {
                $scope.selectedBloqsToolbox = '';
            }

        };

        $scope.init = function() {
            if (currentProjectService.bloqs.varsBloq) {
                bloqs.removeBloq(currentProjectService.bloqs.varsBloq.uuid, true);
                currentProjectService.bloqs.varsBloq = null;
                bloqs.removeBloq(currentProjectService.bloqs.setupBloq.uuid, true);
                currentProjectService.bloqs.setupBloq = null;
                bloqs.removeBloq(currentProjectService.bloqs.loopBloq.uuid, true);
                currentProjectService.bloqs.loopBloq = null;
            }

            currentProjectService.bloqs.varsBloq = bloqs.buildBloqWithContent($scope.currentProject.software.vars, currentProjectService.componentsArray, bloqsApi.schemas, $scope.$field);
            currentProjectService.bloqs.setupBloq = bloqs.buildBloqWithContent($scope.currentProject.software.setup, currentProjectService.componentsArray, bloqsApi.schemas);
            currentProjectService.bloqs.loopBloq = bloqs.buildBloqWithContent($scope.currentProject.software.loop, currentProjectService.componentsArray, bloqsApi.schemas);

            $scope.$field.append(currentProjectService.bloqs.varsBloq.$bloq, currentProjectService.bloqs.setupBloq.$bloq, currentProjectService.bloqs.loopBloq.$bloq);
            currentProjectService.bloqs.varsBloq.enable(true);
            currentProjectService.bloqs.varsBloq.doConnectable();

            currentProjectService.bloqs.setupBloq.enable(true);
            currentProjectService.bloqs.setupBloq.doConnectable();

            currentProjectService.bloqs.loopBloq.enable(true);
            currentProjectService.bloqs.loopBloq.doConnectable();

            bloqs.updateDropdowns();

            $scope.$trashcan = $('#trashcan').last();
        };

        $scope.initFreeBloqs = function() {
            var tempBloq, i, j,
                lastBottomConnector;

            bloqs.destroyFreeBloqs();
            if ($scope.currentProject.software.freeBloqs && ($scope.currentProject.software.freeBloqs.length > 0)) {
                for (i = 0; i < $scope.currentProject.software.freeBloqs.length; i++) {
                    lastBottomConnector = null;
                    for (j = 0; j < $scope.currentProject.software.freeBloqs[i].bloqGroup.length; j++) {
                        // $log.debug( $scope.currentProject.software.freeBloqs[i].bloqGroup[j]);
                        tempBloq = bloqs.buildBloqWithContent($scope.currentProject.software.freeBloqs[i].bloqGroup[j], currentProjectService.componentsArray, bloqsApi.schemas);

                        if (lastBottomConnector) {
                            bloqs.connectors[lastBottomConnector].connectedTo = tempBloq.connectors[0];
                            bloqs.connectors[tempBloq.connectors[0]].connectedTo = lastBottomConnector;

                        } else {
                            tempBloq.$bloq[0].style.transform = 'translate(' + $scope.currentProject.software.freeBloqs[i].position.left + 'px,' + $scope.currentProject.software.freeBloqs[i].position.top + 'px)';
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

        $scope.onFieldKeyDown = function(event) {
            if ((event.keyCode === 8) && $document[0].activeElement.attributes['data-bloq-id']) {
                event.preventDefault();
                var bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
                    bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
                    $scope.$field.focus();
                    $scope.saveBloqStep();
                    currentProjectService.startAutosave();
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
                            currentProjectService.startAutosave();
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

        $scope.performFactoryReset = function() {
            var robot = $scope.currentProject.hardware.robot,
                version = $scope.common.properties.robotsFirmwareVersion[robot];
            robotFirmwareApi.getFirmware(robot, version).then(function(result) {
                if ($scope.common.useChromeExtension()) {
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

        $scope.removeBloqFromContextMenu = function(bloq) {
            bloqs.removeBloq(bloq.uuid, true);
            //saveBloqStep from here to not listen remove event from children and store one step for children
            $scope.saveBloqStep();
            currentProjectService.startAutosave();
        };

        $scope.searchBloq = function() {
            var userComponents = _.pick(currentProjectService.componentsArray, function(value) {
                return value.length > 0;
            });
            if (userComponents.indexOf($scope.searchText)) {
                //Todo pintar en un contenedor nuevo
            }
        };
        $scope.clickTwitterConfig = function() {
            $scope.twitterSettings = !$scope.twitterSettings;
        };

        $scope.setSoftwareTab = function(tab) {
            $scope.softTab = tab;
            if (tab === 'code') {
                $scope.setCode(currentProjectService.getCode());
            } else if (tab === 'bloqs') {
                $rootScope.$emit('currenttab:bloqstab');
            }
        };

        $scope.showComponents = function(item) {
            var result = false;
            var stopWord = ['analogWrite', 'viewer', 'digitalWrite', 'pinReadAdvanced', 'pinWriteAdvanced', 'turnOnOffAdvanced', 'digitalReadAdvanced', 'analogReadAdvanced', 'pinLevels'];
            if (stopWord.indexOf(item) === -1) {
                var i;
                if ($scope.currentProject.hardware.board && $scope.currentProject.hardware.components) {
                    var connectedComponents = $scope.currentProject.hardware.components;
                    if (item === 'hwVariable' && connectedComponents.length !== 0) {
                        result = true;
                    } else if (item === 'led') {
                        result = existComponent(['led'], connectedComponents);
                    } else if (item === 'readSensor') {
                        result = existComponent([
                            'us', 'button', 'limitswitch', 'encoder',
                            'sound', 'buttons', 'irs', 'irs2',
                            'joystick', 'ldrs', 'pot'
                        ], connectedComponents);
                    } else if (item.indexOf('serial') > -1) {
                        result = showCommunications(item);

                    } else if (item.indexOf('phone') > -1) {
                        result = $scope.currentProject.useBitbloqConnect;
                    } else if (item.includes('rgb')) {
                        result = existComponent(['RGBled'], connectedComponents);
                    } else if (item.includes('oscillator')) {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if ((connectedComponents[i].id === 'servo') && connectedComponents[i].oscillator && (connectedComponents[i].oscillator !== 'false')) {
                                result = true;
                            }
                            i++;
                        }
                    } else if (item.includes('continuousServo')) {
                        result = existComponent(['servocont'], connectedComponents);
                    } else if ((item === 'servoAttach') || (item === 'servoDetach')) {
                        result = existComponent(['servo', 'servocont'], connectedComponents);
                    } else if (item.includes('servo')) {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if ((connectedComponents[i].id === 'servo') && (connectedComponents[i].oscillator !== true)) {
                                result = true;
                            }
                            i++;
                        }
                    } else {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if (connectedComponents[i].id.includes(item) ||
                                item.toLowerCase().includes(connectedComponents[i].id))
                            {
                                result = true;
                            }
                            i++;
                        }
                    }
                }

            } else {
                result = true;
            }
            return result;
        };

        function checkInputLength() {
            setScrollsDimension();
        }

        function clickDocumentHandler() {
            $contextMenu.css({
                display: 'none'
            });

            if ($('#twitter-config-button:hover').length === 0 && $('#twitter-content:hover').length === 0) {
                $scope.twitterSettings = false;
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
        }

        function contextMenuDocumentHandler(event) {

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
        }

        function copyBloq(bloq) {

            var newBloq = bloqs.buildBloqWithContent(bloq.structure, currentProjectService.componentsArray, bloqsApi.schemas);

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

        function existComponent(componentsToSearch, components) {
            var found,
                j,
                i = 0;

            while (!found && (i < componentsToSearch.length)) {
                j = 0;
                while (!found && (j < components.length)) {
                    if (componentsToSearch[i] === components[j].id) {
                        found = components[j];
                    }
                    j++;
                }
                i++;
            }

            return found;
        }

        function goToCode() {
            ngDialog.closeAll();
            if ($scope.common.user) {
                $scope.common.user.hasBeenWarnedAboutChangeBloqsToCode = true;
                userApi.update({
                    hasBeenWarnedAboutChangeBloqsToCode: true
                });
                if ($scope.currentProject._id) {
                    $location.path('/codeproject/' + $scope.currentProject._id);
                } else {
                    $location.path('/codeproject/');
                }
            } else {
                $scope.common.session.project = $scope.currentProject;
                $location.path('/codeproject/');
            }
        }

        function goToBloq() {
            ngDialog.closeAll();
            $scope.setSoftwareTab('bloqs');
        }

        function loadBloqs() {
            bloqsLoadTimes++;
            bloqsApi.itsLoaded().then(function() {
                    bloqs.setOptions({
                        fieldOffsetLeft: 70,
                        fieldOffsetRight: 216,
                        fieldOffsetTopSource: ['header', 'nav--make', 'actions--make', 'tabs--title'],
                        bloqSchemas: bloqsApi.schemas,
                        suggestionWindowParent: $scope.$field[0]
                    });
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
                    $scope.$on('refresh-bloqs', function() {
                        $scope.init();
                        bloqs.destroyFreeBloqs();
                    });
                    $rootScope.$on('update-bloqs', function() {
                        $scope.init();
                        $scope.initFreeBloqs();
                    });
                    translateChangeStartEvent = $rootScope.$on('$translateChangeStart', function(evt, key) {
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

        function showCommunications(item) {
            var stopWord = ['convert'];
            if (currentProjectService.componentsArray.serialElements) {
                return !(stopWord.indexOf(item) === -1 && currentProjectService.componentsArray.serialElements.length === 0);
            } else {
                return false;
            }
        }

        function onDeleteBloq() {
            _.throttle(setScrollsDimension, 250);
            var twitterConfigBloqs = _.filter(bloqs.bloqs, function(item) {
                return item.bloqData.name === 'phoneConfigTwitter';
            });
            if (twitterConfigBloqs.length === 2) {
                $scope.hideTwitterWheel();
            }
        }

        function onDragEnd(object) {
            if (object.detail.bloq.bloqData.name === 'phoneConfigTwitter') {
                $scope.toolbox.level = 1;
                $timeout(function() {
                    $scope.twitterSettings = true;
                }, 500);
            }
            _.throttle(setScrollsDimension, 1000);
            var mouseItem = {
                top: object.detail.mouseEvent.y - 5,
                left: object.detail.mouseEvent.x - 5,
                width: 10,
                height: 10
            };
            var trashcanItem = {
                top: $scope.$trashcan.offset().top,
                left: $scope.$trashcan.offset().left,
                width: $scope.$trashcan[0].clientWidth,
                height: $scope.$trashcan[0].clientHeight
            };
            var bloqToDelete = utils.itsOver(mouseItem, trashcanItem);
            if (bloqToDelete) {
                bloqs.removeBloq(object.detail.bloq.uuid, false, true);
            }
            $scope.showTrashcan = false;
            $scope.$apply();
        }

        function onMoveBloq(bloq) {
            console.log(bloq);
            $scope.showTrashcan = true;
            // $scope.selectedBloqsToolbox = '';
            $scope.$apply();
        }

        loadBloqs();

        $document.on('contextmenu', contextMenuDocumentHandler);
        $document.on('click', clickDocumentHandler);

        $scope.$watch('common.user.twitterApp.consumerKey', function(oldValue, newValue) {
            if (oldValue && oldValue !== newValue) {
                currentProjectService.saveTwitterApp();
            }
        });

        $scope.$watch('common.user.twitterApp.consumerSecret', function(oldValue, newValue) {
            if (oldValue && oldValue !== newValue) {
                currentProjectService.saveTwitterApp();
            }
        });

        $scope.$watch('common.user.twitterApp.accessToken', function(oldValue, newValue) {
            if (oldValue && oldValue !== newValue) {
                currentProjectService.saveTwitterApp();
            }
        });

        $scope.$watch('common.user.twitterApp.accessTokenSecret', function(oldValue, newValue) {
            if (oldValue && oldValue !== newValue) {
                currentProjectService.saveTwitterApp();
            }
        });

        $window.onresize = function() {
            $timeout(function() {
                setScrollsDimension();
            }, 10);
        };

        bloqsTabsEvent = $rootScope.$on('currenttab:bloqstab', function() {
            $timeout(function() {
                setScrollsDimension();
            }, 0);
        });

        $scope.$field.on('scroll', scrollField);
        scrollBarContainer.on('scroll', _.throttle(scrollField, 250));
        $window.addEventListener('bloqs:bloqremoved', onDeleteBloq);
        $window.addEventListener('bloqs:dragend', onDragEnd);
        $window.addEventListener('bloqs:startMove', onMoveBloq);

        $scope.$on('$destroy', function() {
            $document.off('contextmenu', contextMenuDocumentHandler);
            $document.off('click', clickDocumentHandler);
            $window.removeEventListener('bloqs:bloqremoved', onDeleteBloq);
            $window.removeEventListener('bloqs:dragend', onDragEnd);
            $window.removeEventListener('bloqs:startMove', onMoveBloq);
            bloqsTabsEvent();
            translateChangeStartEvent();
        });
    });
