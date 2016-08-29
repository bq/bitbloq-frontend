(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:forumCtrl
     * @description
     * # forumCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ForumCtrl', function forumCtrl($log, $routeParams, userApi, $location, $route, $scope, common, forumApi, alertsService, utils, _, imageApi, $rootScope, ngDialog, commonModals) {
            var forum = this;
            forum.displayedView = 'main';
            forum.commonModals = commonModals;
            forum.bannedUserPerPage = 10;
            forum.categoryThemesPerPage = 10;
            forum.banUser = userApi.banUser;
            forum.textEditorContent = {
                htmlContent: ''
            };
            forum.answer = {
                imageCounter: 0,
                images: []
            };
            forum.results = {
                show: false,
                data: [],
                totalSize: 0
            };

            forum.disabledNewTopic = false;
            forum.currentPage = 1;
            forum.itemsPerPage = 10; //might be modified by the server

            forum.isAdmin = function() {
                if (common.user) {
                    return common.user.role === 'admin';
                } else {
                    return false;
                }
            };

            // *************************************
            // only admin user
            // *************************************
            forum.deleteAnswer = function(answer) {
                forumApi.deleteAnswer(answer).then(function() {
                    var index = forum.themeAnswers.indexOf(answer);
                    if (index > -1) {
                        forum.themeAnswers.splice(index, 1);
                    }
                }, function() {
                    alertsService.add({
                        text: 'forumAdmin_alert_deletedAnswerError',
                        id: 'deleteAnswer',
                        type: 'error'
                    });
                });
            };

            forum.deleteThread = function(themeId) {
                forumApi.deleteThread(themeId).then(function() {
                    alertsService.add({
                        text: 'forumAdmin_alert_deletedTheme',
                        id: 'deleteThread',
                        type: 'warning',
                        time: 5000
                    });
                    $location.url('/forum/' + forum.themeCategory);
                }).catch(function() {
                    alertsService.add({
                        text: 'forumAdmin_alert_deletedThemeError',
                        id: 'deleteThread',
                        type: 'error'
                    });
                });
            };

            forum.moveThread = function(themeId) {

                var confirmAction = function() {
                        adminmodal.close();
                        if (modalOptions.dropdown.option) {
                            forumApi.moveThread(themeId, modalOptions.dropdown.option).then(function() {
                                forum.themeCategory = modalOptions.dropdown.option;
                                $route.current.pathParams.forumsection = modalOptions.dropdown.option;
                                $location.url('/forum/' + $route.current.pathParams.forumsection + '/' + $route.current.pathParams.forumresource);
                                alertsService.add({
                                    text: $scope.common.translate('forumAdmin_alert_MoveThemeTo') + ' "' + modalOptions.dropdown.option + '"',
                                    id: 'moveTheme',
                                    type: 'ok',
                                    time: 5000
                                });
                            }).catch(function() {
                                alertsService.add({
                                    text: 'forumAdmin_alert_MoveThemeToError',
                                    id: 'moveTheme',
                                    type: 'error'
                                });
                            });
                        }
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'forumAdmin_buton_moveTheme',
                    confirmButton: 'forumAdmin_buton_moveTheme',
                    rejectButton: 'modal-button-cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/input.html',
                    modalButtons: true,
                    modalDropdown: true,
                    headingOptions: forum.themeCategory,
                    modaloptions: forum.categories,
                    optionsClick: function(category) {
                        modalOptions.dropdown.option = category;
                    },
                    dropdown: {
                        option: '',
                        dataElement: 'categories-dropdown-button'
                    }
                });

                var adminmodal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions,
                    showClose: false
                });
            };

            //**************************************

            forum.goForumSection = function(section) {
                if (section) {
                    switch (section) {
                        case 'new-theme':
                            if ($routeParams.forumsection !== 'new-theme') {
                                forum.selectedOption = $routeParams.forumsection;
                            }
                            common.itsUserLoaded().then(function() {
                                if (!common.user.bannedInForum) {
                                    _goToSection(section);
                                } else {
                                    alertsService.add({
                                        text: 'forum_alert_accessBannedUser',
                                        id: 'bannedUser',
                                        type: 'error'
                                    });
                                }
                            }).catch(function() {
                                var url = $location.url();
                                $location.path('login').search({
                                    init: url
                                });
                            });
                            break;

                        case 'banned-users':
                            common.itsUserLoaded().then(function() {
                                _getBannedUsers().then(function() {
                                    _goToSection(section);
                                });
                            }).catch(function() {
                                $location.path('login').search({
                                    init: $location.url()
                                });
                            });
                            break;

                        default:
                            _goToSection(section);
                    }
                } else {
                    $location.url('/forum/');
                    forum.displayedView = 'main';
                }
            };

            forum.setPublishCategory = function(category) {
                forum.textEditorContent.category = category;
            };

            forum.submitNewAnswer = function(threadId) {
                var answer = {
                    thread: threadId || forum.currentThread._id,
                    content: '<p>' + forum.textEditorContent.htmlContent + '</p>'
                };
                forum.textEditorContent.htmlContent = '';

                if (threadId) {
                    answer.main = true;
                }

                forumApi.createAnswer(answer).then(function(response) {
                    answer._id = response.data;
                    answer.creator = {
                        _id: common.user._id,
                        username: common.user.username
                    };

                    if (forum.answer.images.length > 0) {
                        var images = [],
                            imageId;
                        forum.answer.images.forEach(function(value, index) {
                            imageId = answer._id + '-' + index;
                            images.push(imageId);
                            imageApi.save(imageId, value, 'forum');
                            if (index === forum.answer.images.length - 1) {
                                answer.images = images;
                                forumApi.updateAnswer(answer).then(function() {
                                    forum.answer.imageCounter = 0;
                                });
                            }
                        });
                    } else {
                        forum.answer.imageCounter = 0;
                    }
                    forum.themeAnswers.push(answer);
                    forum.answer.images = [];

                    var lastPage = parseInt(forum.themeAnswers.length / forum.categoryThemesPerPage);
                    if ((forum.themeAnswers.length % forum.categoryThemesPerPage) > 0) {
                        lastPage += 1;
                    }
                    if (forum.currentPage !== lastPage) {
                        forum.writtenAnswer = true;
                    }
                    forum.currentPage = lastPage;
                    $log.debug('POSTING ANSWER: OK');
                }).catch(function(err) {
                    $log.debug('Error:', err);
                    if (err.status === 401) {
                        alertsService.add({
                            text: 'forum_alert_accessBannedUser',
                            id: 'creatingAnswer',
                            type: 'error'
                        });
                    } else {
                        alertsService.add({
                            text: 'forum_alert_NewAnswerError',
                            id: 'creatingAnswer',
                            type: 'error'
                        });
                    }
                });
            };

            forum.submitNewTheme = function() {
                if (forum.textEditorContent.category && forum.textEditorContent.title && forum.textEditorContent.htmlContent) {
                    var chosenCategory = _.find(forum.categoriesData, function(categoryData) {
                        return categoryData.name === forum.textEditorContent.category;
                    });

                    var thread = {
                        title: forum.textEditorContent.title,
                        category: chosenCategory._id
                    };

                    var answer = {
                        content: '<p>' + forum.textEditorContent.htmlContent + '</p>',
                        main: true
                    };
                    //forum.textEditorContent.htmlContent = '';

                    forum.disabledNewTopic = true;

                    forumApi.createThread(thread, answer).then(function(response) {
                        answer._id = response.data.answer._id;
                        $log.debug('theme: ' + response.data);
                        if (forum.answer.images.length > 0) {
                            var images = [],
                                imageId;
                            forum.answer.images.forEach(function(value, index) {
                                imageId = answer._id + '-' + index;
                                images.push(imageId);
                                imageApi.save(imageId, value, 'forum').then(function() {
                                    alertsService.add({
                                        text: 'forum_alert_NewTheme',
                                        id: 'createdTheme',
                                        type: 'ok',
                                        time: 5000
                                    });
                                    if (index === forum.answer.images.length - 1) {
                                        answer.images = images;
                                        forumApi.updateAnswer(answer).then(function() {
                                            forum.answer.imageCounter = 0;
                                            forum.goForumSection(forum.textEditorContent.category + '/' + response.data.thread._id);
                                        });
                                    }
                                });
                            });
                        } else {
                            alertsService.add({
                                text: 'forum_alert_NewTheme',
                                id: 'createdTheme',
                                type: 'ok',
                                time: 5000
                            });
                            forum.goForumSection(forum.textEditorContent.category + '/' + response.data.thread._id);
                        }

                    }).catch(function(err) {
                        $log.debug('Error creating post:', err);
                        alertsService.add({
                            text: 'forum_alert_NewThemeError',
                            id: 'creatingTheme',
                            type: 'error',
                            time: 5000
                        });
                    }).finally(function() {
                        forum.disabledNewTopic = false;
                    });
                } else {
                    $log.debug('fill inputs');
                }
            };

            forum.addImage = function(e) {
                utils.uploadImage(e, {}).then(function(response) {
                    var image = document.createElement('img');
                    image.src = response.img.src;
                    image.className = 'answerImg' + forum.answer.imageCounter + ' BitbloqImg';
                    var tmp = document.createElement('div');
                    tmp.appendChild(image);
                    if (forum.textEditorContent.htmlContent === '') {
                        forum.textEditorContent.htmlContent = '<p>' + tmp.innerHTML + '<br/></p>';
                    } else {
                        forum.textEditorContent.htmlContent += tmp.innerHTML;
                    }
                    forum.answer.imageCounter++;
                    forum.answer.images.push(response.file);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }).catch(function(response) {
                    switch (response.error) {
                        case 'heavy':
                            alertsService.add({
                                text: 'info-tab-image-heavy-error',
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

            forum.allowUser = function(user) {
                userApi.unbanUser(user._id).then(function() {
                    alertsService.add({
                        text: 'forumAdmin_alert_allowUser',
                        id: 'banUser',
                        type: 'ok',
                        time: 5000
                    });
                    _.remove(forum.bannedUsers, user);
                }).catch(function() {
                    alertsService.add({
                        text: 'forumAdmin_alert_allowUserError',
                        id: 'banUser',
                        type: 'error'
                    });
                });
            };

            forum.refreshSearchLayout = function() {
                forum.results.show = forum.searchText !== '' && forum.searchText !== undefined;
                if (forum.results.show) {
                    forumApi.searchThreads(forum.searchText, forum.currentPage).then(function(result) {
                        forum.results.data = result.data.threads;
                        forum.results.totalSize = result.data.count;
                        forum.itemsPerPage = result.data.itemsPerPage;
                    });
                }
            };

            function _getBannedUsers() {
                return userApi.getBannedUsers().then(function(response) {
                    forum.bannedUsers = response.data;
                });
            }

            function setForumRoute() {
                if ($routeParams.forumresource !== '"undefined"' && $routeParams.forumresource) {
                    $location.url('/forum/' + $routeParams.forumsection + '/' + $routeParams.forumresource);
                    forum.displayedView = 'theme';
                    goForumTheme($routeParams.forumresource, $routeParams.forumsection);
                } else if ($routeParams.forumsection !== '"undefined"' && $routeParams.forumsection) {
                    var section = $routeParams.forumsection;
                    switch (section) {
                        case 'new-theme':
                            common.itsUserLoaded().then(function() {
                                forum.displayedView = 'new-theme';
                            }, function() {
                                $location.path('/login');
                            });
                            break;
                        case 'banned-users':
                            common.itsUserLoaded().then(function() {
                                forum.displayedView = 'banned-users';
                                // _getBannedUsers();
                            }, function() {
                                $location.path('/login');
                            });
                            break;
                        default:
                            goForumCategory(section);
                    }

                    $route.current.pathParams.forumsection = section;
                    $location.url('/forum/' + section);
                }
            }

            function manageRoute(route) {
                var arrayRoute = route.splice(5, route.length - 1);
                if (arrayRoute[0] === 'forum') {
                    var category = arrayRoute[1],
                        theme = arrayRoute[2];
                    if (!theme && category) {
                        if (category === 'new-theme') {
                            common.itsUserLoaded().then(function() {
                                if (!common.user.bannedInForum) {
                                    forum.goForumSection('new-theme');
                                } else {
                                    alertsService.add({
                                        text: 'forum_alert_accessBannedUser',
                                        id: 'bannedUser',
                                        type: 'error'
                                    });
                                }
                            }, function() {
                                $location.path('/login');
                            });
                        } else if (category === 'banned-users') {
                            common.itsUserLoaded().then(function() {
                                forum.goForumSection('banned-users');
                            }, function() {
                                $location.path('/login');
                            });
                        } else {
                            $log.debug('Categoría: ', category);
                            var chosenCategory = _.find(forum.categoriesData, function(categoryData) {
                                return categoryData.name === decodeURIComponent(category);
                            });
                            if (!chosenCategory) {
                                $location.path('/404');
                            }
                        }
                    }

                }
            }

            function goForumTheme(themeId, themeCategory) {
                forumApi.getTheme(themeId).then(function(response) {
                    forum.currentThread = response.data.thread;
                    forum.themeCategory = themeCategory;
                    var answers = response.data.answers,
                        container;
                    answers.forEach(function(answer) {
                        if (answer.content.indexOf('<img') > -1) {
                            container = document.createElement('div');
                            container.innerHTML = answer.content;
                            var images = container.querySelectorAll('img.BitbloqImg');
                            for (var i = 0; i < images.length; i++) {
                                var img = images[i],
                                    imgIndex = img.className.split(' ')[0].split('answerImg')[1];
                                var answerImage = container.getElementsByClassName('answerImg' + imgIndex)[0];
                                if (answerImage) {
                                    answerImage.src = common.urlImage + 'forum/' + answer._id + '-' + imgIndex;
                                }
                                answer.content = container.innerHTML;
                            }
                        }
                    });
                    forum.firstAnswer = answers.shift();
                    forum.themeAnswers = answers;
                }).catch(function(err) {
                    $location.path('/404');
                    $log.debug('Error:', err);
                });
            }

            function goForumCategory(category) {
                forum.displayedView = 'category';
                forum.currentCategory = category;
                forumApi.getThemesInCategory(category).then(function(response) {
                    forum.categoryThemes = response.data.threads;
                    forum.categoryPages = forum.categoryThemes.length / 5;
                }, function(err) {
                    $log.error('ERROR: ', err);
                });

            }

            function _goToSection(section) {
                $route.current.pathParams.forumsection = section;
                $location.url('/forum/' + section);
                forum.displayedView = section;
            }

            function groupCategoriesBySection() {
                return _.chain(forumCategories).sortBy('section').groupBy('section').value();
            }

            function addRouteListener() {
                $scope.$on('$locationChangeSuccess', function(next, route) {
                    manageRoute(route.split('/'));
                });
            }

            function getMainForum() {
                return forumApi.getForumIndex().then(function(response) {
                    forumCategories = response.data;
                    forum.sections = groupCategoriesBySection();
                    getCategoryNames(forumCategories);
                });
            }

            function getCategoryNames(categories) {
                if (categories) {
                    forum.categories = categories.map(function(category) {
                        return category.name;
                    });
                    forum.categoriesData = categories.map(function(category) {
                        return {
                            name: category.name,
                            _id: category._id
                        };
                    });
                }
            }

            function init() {
                if (!forum.categories) {
                    getMainForum().then(function() {
                        getCategoryNames();
                    });
                    setForumRoute();
                    addRouteListener();
                }
            }

            var forumCategories;

            init();
        });

})();
