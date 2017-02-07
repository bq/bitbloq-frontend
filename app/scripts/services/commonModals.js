'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.modals
 * @description
 * # modals
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('commonModals', function(feedbackApi, alertsService, $rootScope, $translate, $compile, userApi, envData, _, ngDialog, $window, common, projectApi, exerciseApi, utils, $location, clipboard, $q, chromeAppApi) {

        var exports = {},
            shortUrl,
            serialMonitorPanel,
            plotterMonitorPanel,
            viewerMonitorPanel;

        exports.contactModal = function() {
            var dialog,
                modalScope = $rootScope.$new(),
                confirmAction = function() {
                    dialog.close();
                    feedbackApi.send(modalScope.comments).success(function() {
                        alertsService.add({
                            text: 'modal-comments-done',
                            id: 'modal-comments',
                            type: 'ok',
                            time: 5000
                        });
                    }).error(function() {
                        alertsService.add({
                            text: 'modal-comments-error',
                            id: 'modal-comments',
                            type: 'warning'
                        });
                    });
                };

            _.extend(modalScope, {

                title: 'modal-contact-us-title',
                content: 'modal-contact-us',
                confirmButton: 'send',
                modalButtons: true,
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/sendComments.html',

                condition: function() {
                    return this.comments.message.length > 0;
                },
                comments: {
                    message: '',
                    userAgent: $window.navigator.userAgent,
                    creator: common.user
                }
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--send-comments',
                scope: modalScope
            });
            $('textarea.msd-elastic').autogrow({
                onInitialize: true
            });
        };

        exports.sendCommentsModal = function() {
            var dialog,
                modalScope = $rootScope.$new(),
                confirmAction = function() {
                    dialog.close();
                    feedbackApi.send(modalScope.comments).success(function() {
                        alertsService.add({
                            text: 'modal-comments-done',
                            id: 'modal-comments',
                            type: 'ok',
                            time: 5000
                        });
                    }).error(function() {
                        alertsService.add({
                            text: 'modal-comments-error',
                            id: 'modal-comments',
                            type: 'warning'
                        });
                    });
                };

            _.extend(modalScope, {

                title: 'modal-send-comments-title',
                content: 'modal-send-comments',
                confirmButton: 'send',
                modalButtons: true,
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/sendComments.html',

                condition: function() {
                    return this.comments.name.length > 0 && this.comments.message.length > 0;
                },
                comments: {
                    message: '',
                    userAgent: $window.navigator.userAgent,
                    creator: common.user
                }
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--send-comments',
                scope: modalScope
            });
            $('textarea.msd-elastic').autogrow({
                onInitialize: true
            });
        };

        exports.launchChangeLanguageModal = function() {
            var oldLanguage = $translate.use(),
                newLanguage;

            var confirmAction = function() {
                    languageModal.close();
                    // Apply changes
                    if (common.user) {
                        common.saveUserLanguage(newLanguage);
                    } else {
                        localStorage.guestLanguage = newLanguage;
                    }
                    $translate.use(newLanguage);
                },
                translateLanguage = function(language) {
                    newLanguage = language;
                    $translate.use(language);
                },
                rejectAction = function() {
                    if (!common.user) {
                        $translate.use(oldLanguage);
                    } else {
                        $translate.use(common.user.language);
                    }
                },
                languageModal,
                modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'header-change-language',
                confirmButton: 'change-language',
                rejectButton: 'modal-button-cancel',
                confirmAction: confirmAction,
                rejectAction: rejectAction,
                contentTemplate: '/views/modals/input.html',
                modalButtons: true,
                modalDropdown: true,
                headingOptions: $translate.use(),
                modaloptions: envData.config.supportedLanguages,
                optionsClick: translateLanguage,
                dropdown: {
                    options: 'languages',
                    dataElement: 'languages-dropdown-button'
                },
                translate: function(language) {
                    modalOptions.lang = language;
                },
                condition: function() {
                    return true;
                }
            });

            languageModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--input',
                scope: modalOptions
            });
        };

        exports.errorFeedbackModal = function() {
            var dialog,
                modalScope = $rootScope.$new(),
                confirmAction = function() {
                    dialog.close();
                    feedbackApi.send(modalScope.comments).success(function() {
                        alertsService.add({
                            text: 'modal-send-error-done',
                            id: 'modal-send-error',
                            type: 'ok',
                            time: 5000
                        });
                    }).error(function() {
                        alertsService.add({
                            text: 'modal-send-error-error',
                            id: 'modal-send-error',
                            type: 'warning'
                        });
                    });
                };

            _.extend(modalScope, {
                title: 'modal-inform-error-title',
                confirmOnly: true,
                confirmButton: 'send',
                modalButtons: true,
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/feedbackError.html',
                comments: {
                    message: '',
                    os: '',
                    browser: '',
                    userAgent: $window.navigator.userAgent,
                    creator: common.user
                },
                condition: function() {
                    return this.comments.message.length > 0 && this.comments.os.length > 0 && this.comments.browser.length > 0;
                }
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--feedback-error',
                scope: modalScope
            });

            $('textarea.msd-elastic').autogrow({
                onInitialize: true
            });
        };

        exports.publishModal = function(project) {
            if (!project.image || project.image === 'default') {
                $rootScope.$emit('generate:image');
            }
            var confirmAction = function() {
                    publishModal.close();
                    projectApi.publish(project).then(function() {
                        alertsService.add({
                            text: 'publish-project-done',
                            id: 'publishing-project',
                            type: 'ok',
                            time: 5000
                        });
                    }, function() {
                        alertsService.add({
                            text: 'publish-project-error',
                            id: 'publishing-project',
                            type: 'warning'
                        });
                    });
                },

                modalScope = $rootScope.$new(),
                publishModal;

            _.extend(modalScope, {
                title: 'modalPublish_title',
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/publish.html',
                publish: true
            });

            publishModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--publish',
                scope: modalScope
            });
        };

        exports.doPrivateProject = function(project) {
            var confirmAction = function() {
                    privateModal.close();
                    projectApi.private(project).then(function() {
                        alertsService.add({
                            text: 'private-project-done',
                            id: 'publishing-project',
                            type: 'ok',
                            time: 5000
                        });
                    }, function() {
                        alertsService.add({
                            text: 'private-project-error',
                            id: 'publishing-project',
                            type: 'warning'
                        });
                    });
                },
                modalScope = $rootScope.$new(),
                privateModal;

            _.extend(modalScope, {
                title: 'modalPublish_title_doPrivate',
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/publish.html',
                publish: false
            });

            privateModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--publish',
                scope: modalScope
            });

        };

        exports.modalShareWithUsers = function(project) {
            var emailsShared = userApi.getAliasByACL(project._acl);

            var confirmAction = function() {
                    var users = _.pluck(modalScope.shareWithUserModel, 'text');
                    var userIndex = users.indexOf(common.user.email);
                    if (userIndex > -1) {
                        users.splice(userIndex, 1);
                    }
                    projectApi.shareWithUsers(project._id, users).then(function(response) {
                        if (response) {
                            project._acl = response.data.project._acl;
                            if (response.data.noUsers.length > 0) {
                                _shareUserInfoModal(response.data.noUsers, response.data.users.length);
                            } else {
                                alertsService.add({
                                    text: 'modalShare_alert_shareWithUser',
                                    id: 'private-project',
                                    type: 'ok',
                                    time: 5000,
                                    value: response.data.users.length
                                });
                            }
                        }
                    }).catch(function() {
                        alertsService.add({
                            text: 'make-share-with-users-error',
                            id: 'private-project',
                            type: 'warning'
                        });
                    }).finally(function() {
                        dialog.close();
                    });
                },

                modalScope = $rootScope.$new(),
                dialog;

            _.extend(modalScope, {
                title: 'share-with-users',
                modalButtons: true,
                confirmButton: 'modal-button-ok',
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/shareWithUsers.html',
                shareWithUserModel: emailsShared
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--share-with-users',
                scope: modalScope
            });
        };

        exports.shareSocialModal = function(project) {
            var parent = $rootScope,
                shareModal,
                modalOptions = parent.$new();
            _.extend(modalOptions, {
                title: 'share-social-networks',
                contentTemplate: '/views/modals/shareSocialNetworks.html',
                stats: {
                    twitterCount: 0,
                    facebookCount: 0,
                    googleCount: 0
                },
                shortUrl: '',
                isOwner: utils.userIsOwner(project, common.user._id),
                addCount: function(e) {
                    var link;
                    switch (e.currentTarget.id) {
                        case 'facebook':
                            //projectApi.addProjectStats(project._id, 'facebookCount');
                            modalOptions.stats.facebookCount += 1;
                            link = 'https://www.facebook.com/sharer/sharer.php?u=' + shortUrl;
                            break;
                        case 'twitter':
                            //projectApi.addProjectStats(project._id, 'twitterCount');
                            modalOptions.stats.twitterCount += 1;
                            link = 'https://twitter.com/intent/tweet?url=' + shortUrl;
                            break;
                        case 'googleplus':
                            //projectApi.addProjectStats(project._id, 'googleCount');
                            modalOptions.stats.googleCount += 1;
                            link = 'https://plus.google.com/share?url=' + shortUrl;
                            break;
                        default:
                            throw 'unknown social network';
                    }
                    if (!project._acl.ALL || project._acl.ALL.permission !== 'READ') {
                        projectApi.publish(project).then(function() {
                            shareModal.close();
                            alertsService.add({
                                text: 'publish-project-done',
                                id: 'publishing-project',
                                type: 'ok',
                                time: 7000
                            });
                        }, function() {
                            alertsService.add({
                                text: 'publish-project-error',
                                id: 'publishing-project',
                                type: 'warning'
                            });
                        });
                    } else {
                        shareModal.close();
                    }
                    $window.open(link);
                },
                shareWithBitbloqUsers: function() {
                    shareModal.close();
                    exports.modalShareWithUsers(project);
                },
                simplePublish: function() {
                    if (!project._acl.ALL) {
                        projectApi.publish(project).then(function() {
                            alertsService.add({
                                text: 'publish-project-done',
                                id: 'publishing-project',
                                type: 'ok',
                                time: 7000
                            });
                        }, function() {
                            alertsService.add({
                                text: 'publish-project-error',
                                id: 'publishing-project',
                                type: 'warning'
                            });
                        });
                    }
                }
            });

            projectApi.generateShortUrl($location.protocol() + '://' + $location.host() + '/#/project/' + project._id)
                .success(function(response) {
                    shortUrl = response.id;
                    _.extend(modalOptions, {
                        shortUrl: shortUrl,
                        copyAction: function(shortLink) {
                            clipboard.copyText(shortLink);
                        }
                    });
                }).error(function() {
                    _.extend(modalOptions, {
                        shortUrl: $location.protocol() + '://' + $location.host() + '/#/project/' + project._id
                    });
                });

            shareModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container',
                scope: modalOptions
            });
        };

        exports.clone = function(project, openInTab, type) {
            type = type || 'project';
            var modalTitle,
                defaultTitle,
                mainText,
                currentApi,
                modalOptions = $rootScope.$new(),
                defered = $q.defer(),
                newProjectName = common.translate('modal-clone-project-name') + project.name;

            if (!project.name) {
                project.name = common.translate(defaultTitle);
            }

            function confirmAction(newName) {
                alertsService.add({
                    text: 'make-cloning-project',
                    id: 'clone-project',
                    type: 'ok',
                    time: 5000
                });
                currentApi.clone(project._id, newName).then(function(newProjectId) {
                    alertsService.add({
                        text: 'make-cloned-project',
                        id: 'clone-project',
                        type: 'ok',
                        time: 5000
                    });
                    if (newProjectId.data && openInTab) {
                        var newtab = $window.open('', '_blank');
                        newtab.location = (type === 'project' ? '#/bloqsproject/' : '#/exercise/') + newProjectId.data;
                    }
                    defered.resolve(newProjectId.data);
                });
                return true;
            }

            if (type === 'project') {
                currentApi = projectApi;
                modalTitle = 'modal-change-project-name-title';
                defaultTitle = 'new-project';
                mainText = 'modal-change-project-name-maintext';
            } else {
                currentApi = exerciseApi;
                modalTitle = 'centerMode_modal_cloneExercise-title';
                defaultTitle = 'new-exercise';
                mainText = 'centerMode_modal_cloneExercise-maintext';
            }

            _.extend(modalOptions, {
                title: modalTitle,
                contentTemplate: 'views/modals/input.html',
                mainText: mainText,
                modalInput: true,
                input: {
                    id: 'projectCloneName',
                    name: 'projectCloneName',
                    placeholder: mainText,
                    value: newProjectName
                },
                confirmButton: 'modal-button-ok',
                rejectButton: 'modal-button-cancel',
                confirmAction: confirmAction,
                modalButtons: true,
                condition: function() {
                    /*jshint validthis: true */
                    return !!this.$parent.input.value;
                }
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--input',
                scope: modalOptions

            });

            return defered.promise;
        };

        exports.rename = function(project, type) {
            type = type || 'project';
            var modalTitle,
                defaultTitle,
                mainText,
                renameModal,
                defered = $q.defer(),
                currentProjectName = project.name,
                modalOptions = $rootScope.$new();

            function confirmAction() {
                project.name = modalOptions.project.name || $translate.instant(defaultTitle);
                renameModal.close();
                defered.resolve();
            }

            if (type === 'project') {
                modalTitle = 'modal-change-project-name-title';
                defaultTitle = 'new-project';
                mainText = 'modal-change-project-name-maintext';
            } else {
                modalTitle = 'centerMode_modal_renameExercise-title';
                defaultTitle = 'new-exercise';
                mainText = 'centerMode_modal_renameExercise-maintext';
            }

            _.extend(modalOptions, {
                title: modalTitle,
                modalButtons: true,
                confirmButton: 'save',
                rejectButton: 'cancel',
                changeName: true,
                modalInput: true,
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/input.html',
                mainText: mainText,
                project: {
                    name: currentProjectName
                },
                condition: function() {
                    /*jshint validthis: true */
                    return !!this.$parent.project.name;
                }
            });

            renameModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--input',
                scope: modalOptions
            });
            return defered.promise;
        };

        exports.launchPlotterWindow = function(board) {
            if (plotterMonitorPanel) {
                plotterMonitorPanel.normalize();
                plotterMonitorPanel.reposition('center');
                return;
            }

            var scope = $rootScope.$new();
            scope.board = board;
            scope.setOnUploadFinished = function(callback) {
                scope.uploadFinished = callback;
            };

            plotterMonitorPanel = $.jsPanel({
                id: 'plotter',
                position: 'center',
                addClass: {
                    content: 'plotter__content'
                },
                size: {
                    width: 800,
                    height: 520
                },
                onclosed: function() {
                    scope.$destroy();
                    plotterMonitorPanel = null;
                },
                title: $translate.instant('plotter'),
                ajax: {
                    url: 'views/plotter.html',
                    done: function() {
                        this.html($compile(this.html())(scope));
                    }
                }
            });
            plotterMonitorPanel.scope = scope;

        };

        exports.launchViewerWindow = function(board, components) {
            if (viewerMonitorPanel) {
                viewerMonitorPanel.normalize();
                viewerMonitorPanel.reposition('center');
                return;
            }

            var scope = $rootScope.$new();
            scope.board = board;
            scope.componentsJSON = components;
            scope.setOnUploadFinished = function(callback) {
                scope.uploadFinished = callback;
            };

            viewerMonitorPanel = $.jsPanel({
                id: 'plotter',
                position: 'center',
                /*  addClass: {
                 content: 'plotter__content'
                 },*/
                size: {
                    width: 855,
                    height: 500
                },
                onclosed: function() {
                    scope.$destroy();
                    viewerMonitorPanel = null;
                },
                title: $translate.instant('viewer'),
                ajax: {
                    url: 'views/viewer.html',
                    done: function() {
                        this.html($compile(this.html())(scope));
                    }
                }
            });
            viewerMonitorPanel.scope = scope;

        };

        exports.launchSerialWindow = function(board) {
            if (serialMonitorPanel) {
                serialMonitorPanel.normalize();
                serialMonitorPanel.reposition('center');
                return;
            }
            var scope = $rootScope.$new();
            scope.board = board;
            scope.setOnUploadFinished = function(callback) {
                scope.uploadFinished = callback;
            };
            serialMonitorPanel = $.jsPanel({
                position: 'center',
                size: {
                    width: 500,
                    height: 500
                },
                onclosed: function() {
                    scope.$destroy();
                    serialMonitorPanel = null;
                },
                title: $translate.instant('serial'),
                ajax: {
                    url: 'views/serialMonitor.html',
                    done: function() {
                        this.html($compile(this.html())(scope));
                    }
                }
            });
            serialMonitorPanel.scope = scope;
        };
        exports.noAddTeachers = function(teachers, added) {
            var noShareModal, confirmAction = function() {
                    noShareModal.close();
                    alertsService.add({
                        text: 'modalShare_alert_addTeacher ',
                        id: 'private-project',
                        type: 'ok',
                        time: 5000,
                        value: added
                    });
                },
                modalScope = $rootScope.$new();

            _.extend(modalScope, {
                title: 'newTeacher_modal_aceptButton',
                modalButtons: true,
                confirmButton: 'modal__understood-button',
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/centerMode/noAddTeachers.html',
                teachers: teachers
            });

            noShareModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--share-no-users',
                scope: modalScope
            });
        };

        function _shareUserInfoModal(noUsers, usersLength) {
            var noShareModal, confirmAction = function() {
                    noShareModal.close();
                    alertsService.add({
                        text: 'modalShare_alert_shareWithUser',
                        id: 'private-project',
                        type: 'ok',
                        time: 5000,
                        value: usersLength
                    });
                },
                modalScope = $rootScope.$new();

            _.extend(modalScope, {
                title: 'share-with-users',
                modalButtons: true,
                confirmButton: 'modal__understood-button',
                confirmAction: confirmAction,
                contentTemplate: '/views/modals/noShareInfo.html',
                noUsers: noUsers
            });

            noShareModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--share-no-users',
                scope: modalScope
            });
        }

        exports.requestChromeExtensionActivation = function(text, callback) {
            var modalNeedWeb2boardOnline = $rootScope.$new();
            _.extend(modalNeedWeb2boardOnline, {
                contentTemplate: '/views/modals/alert.html',
                text: text,
                confirmText: 'activate',
                confirmAction: function() {

                    ngDialog.closeAll();
                    chromeAppApi.installChromeApp(function(err) {
                        if (!err) {
                            callback(null);
                        } else {
                            alertsService.add({
                                text: $translate.instant('error-chromeapp-install') + ': ' + $translate.instant(err.error),
                                id: 'chromeapp',
                                type: 'error'
                            });
                            callback(err);
                        }

                    });
                    common.user.chromeapp = true;
                    userApi.update({
                        chromeapp: true
                    });
                }
            });
            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalNeedWeb2boardOnline
            });
        };

        return exports;
    });
