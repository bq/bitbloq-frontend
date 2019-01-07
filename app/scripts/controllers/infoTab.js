'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:InfoTabCtrl
 * @description
 * # InfoTabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('InfoTabCtrl', function ($scope, $rootScope, $routeParams, $log, alertsService, _, utils, projectService, $timeout) {

        var generateImageEvent,
            currentProjectService = $scope.currentProjectService || projectService;

        $scope.currentProject = $scope.currentProject || $scope.currentProject;
        $scope.imagesToUpload = [];
        $scope.projectImages = [0, 1, 2, 3];
        $scope.availableThemes = ['infotab_option_grayTheme', 'infotab_option_colorTheme'];

        $scope.addTag = function (tag, event) {
            if (!event || event.keyCode === 13) {
                if (!!tag) {
                    var tagArray = tag.split(',');
                    tagArray.forEach(function (item) {
                        item = item.trim();
                        if (item && $scope.currentProject.userTags.indexOf(item) === -1) {
                            $scope.currentProject.userTags.push(item);
                        }
                    });
                    currentProjectService.startAutosave();
                    $scope.form.tag = '';
                }
            }
        };

        $scope.getTimes = function (n) {
            return new Array(n);
        };

        $scope.removeTag = function (tag) {
            var indexTag = $scope.currentProject.userTags.indexOf(tag);
            if (indexTag > -1) {
                $scope.currentProject.userTags.splice(indexTag, 1);
                currentProjectService.startAutosave();
            }
        };

        $scope.setTheme = function (theme) {
            $scope.currentProject.defaultTheme = theme;
            currentProjectService.startAutosave();
        };

        $scope.uploadImageTrigger = function (type) {
            $log.debug('uploadImageTrigger');
            if (type === 'main') {
                $log.debug($('.main-image--input'));
                $timeout(function () {
                    $('.main-image--input').click();
                });
            } else {
                $timeout(function () {
                    $('.other-image--input').click();
                });
            }
        };

        $scope.uploadImage = function (e) {
            var properties = {
                minWidth: 600,
                minHeight: 400,
                containerDest: 'projectImage',
                without: /image.gif/
            };
            utils.uploadImage(e, properties).then(function (response) {
                currentProjectService.tempImage.blob = response.blob;
                currentProjectService.tempImage.file = response.file;
                currentProjectService.tempImage.img = response.img;
                currentProjectService.tempImage.generate = false;
                $scope.currentProject.image = 'custom';
                currentProjectService.startAutosave();
            }).catch(function (response) {
                switch (response.error) {
                    case 'heavy':
                        alertsService.add({
                            text: 'info-tab-image-heavy-error',
                            id: 'info-tab-image',
                            type: 'warning'
                        });
                        break;
                    case 'small':
                        alertsService.add({
                            text: 'info-tab-image-small-error',
                            id: 'info-tab-image',
                            type: 'warning'
                        });
                        break;
                    case 'no-image':
                        alertsService.add({
                            text: 'info-tab-image-read-error',
                            id: 'info-tab-image',
                            type: 'warning'
                        });
                        break;
                }
            });
        };

        $scope.isNewProject = !$routeParams.id;
        $scope.modalOpened = false;
        $scope.editGroups = function (currentProject, groups) {
            $scope.modalOpened = true;
            $scope.currentProjectService.assignGroup(currentProject, $scope.common.user._id, groups).then(
              function (response) {
                $scope.modalOpened = false;
                $scope.setGroups(response);
              },
              function () {
                  $scope.modalOpened = false;
              });
          };
        $scope.composeImage = composeImage;

        function composeImage() {
            var canvas = document.getElementById('testcanvas');
            var context = canvas.getContext('2d');
            $log.debug('context', context);
            var imageObj = new Image();
            canvas.width = 775;
            canvas.height = 411;
            if ($scope.currentProject.hardware.board) {
                if ($scope.currentProject.hardware.robot || $scope.currentProject.hardware.showRobotImage) {
                    currentProjectService.getRobotMetaData($scope.currentProject.hardware.showRobotImage).then(function (robotRef) {
                        imageObj.src = '/images/robots/' + robotRef.uuid + '.png';
                    });
                } else {
                    if ($scope.currentProject.hardware.board === 'freakscar') {
                        imageObj.src = '/images/robots/freakscar.png';
                    }
                    var boardRef = currentProjectService.getBoardMetaData();
                    imageObj.src = '/images/boards/' + boardRef.uuid + '.png';
                }
            }

            var components = $scope.currentProject.hardware.components,
                useBitbloqConnect = $scope.currentProject.useBitbloqConnect;

            imageObj.onload = function () {
                if ($scope.currentProject.hardware.robot || $scope.currentProject.hardware.showRobotImage || $scope.currentProject.hardware.board === 'freakscar') {
                    setMainImage(canvas, context, imageObj, $scope.currentProject.hardware.robot || $scope.currentProject.hardware.showRobotImage || $scope.currentProject.hardware.board);
                } else {
                    setMainImage(canvas, context, imageObj, false);
                    setComponentsImage(canvas, context, components, useBitbloqConnect);
                }
            };
        }

        function setComponentsImage(canvas, context, components, useBitbloqConnect) {

            if (useBitbloqConnect) {
                components.unshift({
                    uuid: 'device'
                });
            }

            var limitedComponents = components.slice(0, 4);
            var counter = 0;
            limitedComponents.forEach(function (component) {
                if (!component.integratedComponent) {
                    var componentImage = new Image();
                    componentImage.src = '/images/components/' + component.uuid + '.png';
                    componentImage.onload = function () {
                        setComponentImage(canvas, context, componentImage, counter);
                        counter++;
                        generateImage(canvas);
                    };
                }
            });
        }

        function setComponentImage(canvas, context, imageObj, componentPosition) {
            $log.debug('Set component Image');

            var imageAspectRatio = imageObj.width / imageObj.height;
            var renderableHeight, renderableWidth, xStart, yStart;

            if (componentPosition > 0) {
                xStart = 105 + (componentPosition * 125);
            } else {
                xStart = 105;
            }
            renderableHeight = 120;
            renderableWidth = 120;
            if (imageAspectRatio < 1) {
                renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
                yStart = canvas.height - renderableHeight - 25;
            } else if (imageAspectRatio > 1) {
                renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
                yStart = canvas.height - renderableHeight - 25;
            } else {
                yStart = canvas.height - renderableHeight;
            }
            context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);

        }

        function setMainImage(canvas, context, imageObj, robot) {

            $log.debug('Set board Image');
            var xStart = (canvas.width - 530) / 2;
            context.fillStyle = '#f3f3f3';
            context.fillRect(0, 0, canvas.width, canvas.height);
            if (robot) {
                switch (robot) {
                    case 'mbot':
                        context.drawImage(imageObj, xStart, 30, 542, 348);
                        break;
                    case 'evolution':
                        context.drawImage(imageObj, xStart, 60, 542, 325);
                        break;
                    case 'rangerlandraider':
                        context.drawImage(imageObj, xStart, 30, 533, 350);
                        break;
                    case 'rangerraptor':
                        context.drawImage(imageObj, xStart, 10, 490, 400);
                        break;
                    case 'rangernervousbird':
                        context.drawImage(imageObj, 145, 12, 450, 400);
                        break;
                    case 'startertank':
                        context.drawImage(imageObj, 80, -70, 600, 550);
                        break;
                    case 'starterthreewheels':
                        context.drawImage(imageObj, 110, -70, 500, 600);
                        break;
                    case 'freakscar':
                        context.drawImage(imageObj, 150, 50, 400, 300);
                        break;
                    default:
                        context.drawImage(imageObj, xStart, -60, 542, 542);
                }
            } else {
                context.drawImage(imageObj, xStart, -120, 530, 380);
            }
            generateImage(canvas);

        }

        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {
                type: contentType
            });
            return blob;
        }

        function generateImage(canvas) {
            var pngUrl = canvas.toDataURL();
            var base64String = pngUrl.substr(pngUrl.indexOf(',') + 1);
            $log.debug('Generando imagen...');
            $('#projectImage').attr('src', pngUrl);

            currentProjectService.tempImage.blob = b64toBlob(base64String, 'image/png');
            currentProjectService.tempImage.file = currentProjectService.tempImage.blob;
            currentProjectService.tempImage.generate = true;

            currentProjectService.startAutosave();
        }

        $('#textarea').autogrow({
            onInitialize: true
        });

        /*************************************************
         WATCHERS
         *************************************************/

        generateImageEvent = $rootScope.$on('generate:image', function () {
            $log.debug('composing image');
            composeImage();
        });

        $scope.$on('$destroy', function () {
            generateImageEvent();
        });
    });
