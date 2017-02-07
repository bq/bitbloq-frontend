(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:CenterCtrl
     * @description
     * # CenterCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('CenterCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window, exerciseService) {

            $scope.center = {};
            $scope.exercises = [];
            $scope.group = {};
            $scope.groups = [];
            $scope.teacher = {};
            $scope.teachers = [];
            $scope.sortArray = ['explore-sortby-recent', 'email', 'name', 'surname', 'centerMode_column_groups', 'centerMode_column_students'];
            $scope.secondaryBreadcrumb = false;
            $scope.students = [];
            $scope.orderInstance = 'name';
            $scope.common.urlType = $routeParams.type;
            $scope.urlSubType = $routeParams.subtype;
            $scope.pageno = 1;
            $scope.exercisesCount = 0;
            $scope.itemsPerPage = 10;
            $scope.pagination = {
                current: 1
            };
            $scope.groupArray = {};

            var currentModal;

            $scope.editGroup = function() {
                exerciseService.assignGroup($scope.exercise, $scope.common.user._id, $scope.groups, $scope.center._id)
                    .then(function() {
                        _getTasksByExercise($routeParams.id);
                        _getGroups($routeParams.id);
                    });
            };

            $scope.saveUrl = function(newUrl) {
                $scope.common.lastUrl = $location.url();
                $location.path(newUrl);
            };

            $scope.changeStatusClass = function() {
                centerModeApi.updateGroup($scope.group).catch(function() {
                    alertsService.add({
                        text: 'updateGroup_alert_Error',
                        id: 'deleteGroup',
                        type: 'ko'
                    });
                });
            };

            $scope.closeGroup = function() {
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'closeGroup_modal_title',
                    confirmButton: 'closeGroup_modal_acceptButton',
                    confirmAction: _closeGroupAction,
                    rejectButton: 'modal-button-cancel',
                    textContent: 'closeGroup_modal_info',
                    contentTemplate: '/views/modals/information.html',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteGroup = function() {
                var confirmAction = function() {
                        centerModeApi.deleteGroup($scope.group._id).then(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteGroup',
                                id: 'deleteGroup',
                                type: 'ok',
                                time: 5000
                            });
                            $location.path('center-mode/teacher');
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteGroup-Error',
                                id: 'deleteGroup',
                                type: 'ko'
                            });
                        });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'deleteGroup_modal_title',
                    confirmButton: 'deleteGroup_modal_acceptButton',
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/centerMode/deleteGroup.html',
                    finishAction: _closeGroupAction,
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteTask = function(task) {
                var confirmAction = function() {
                        centerModeApi.deleteTask(task._id).then(function() {
                            _.remove($scope.tasks, task);
                            alertsService.add({
                                text: 'centerMode_alert_deleteTask',
                                id: 'deleteTask',
                                type: 'ok',
                                time: 5000
                            });
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteTask-error',
                                id: 'deleteTask',
                                type: 'ko'
                            });
                        });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    student = $scope.student && $scope.student.firstName ? $scope.student.firstName + $scope.student.lastName : $scope.student.username;
                _.extend(modalOptions, {
                    title: $scope.common.translate('deleteTask_modal_title') + ': ' + task.name,
                    confirmButton: 'button_delete',
                    value: $scope.student.username,
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate('deleteTask_modal_information', {value: student}),
                    secondaryContent: 'deleteTask_modal_information-explain',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteTeacher = function(teacher) {
                var confirmAction = function() {
                        centerModeApi.deleteTeacher(teacher._id, $scope.center._id).then(function() {
                            _.remove($scope.teachers, teacher);
                            alertsService.add({
                                text: 'centerMode_alert_deleteTeacher',
                                id: 'deleteTeacher',
                                type: 'ok',
                                time: 5000
                            });
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteTeacher-Error',
                                id: 'deleteTeacher',
                                type: 'error'
                            });
                        });
                        newTeacherModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'deleteTeacher_modal_title',
                    confirmButton: 'button_delete ',
                    rejectButton: 'cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/information.html',
                    textContent: 'deleteTeacher_modal_information',
                    secondaryContent: 'deleteTeacher_modal_information-explain',
                    modalButtons: true
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteStudent = function(student) {
                var confirmAction = function() {
                        centerModeApi.deleteStudent(student._id, $scope.group._id).then(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteStudent',
                                id: 'deleteStudent',
                                type: 'ok',
                                time: 5000
                            });
                            $location.path('center-mode/group/' + $scope.group._id);
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteStudent-error',
                                id: 'deleteTStudent',
                                type: 'error'
                            });
                        });
                        newTeacherModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    studentName = $scope.student && $scope.student.firstName ? $scope.student.firstName + $scope.student.lastName : $scope.student.username;

                _.extend(modalOptions, {
                    title: 'deleteStudent_modal_title',
                    confirmButton: 'button_delete ',
                    rejectButton: 'cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate('deleteStudent_modal_information', {value: studentName}),
                    secondaryContent: 'deleteStudent_modal_information-explain',
                    modalButtons: true
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.getDatetime = function(date, diff) {
                if (diff) {
                    if (date) {
                        var now = moment();
                        return now.diff(date) > 0;
                    } else {
                        return false;
                    }
                } else {
                    return moment(date).fromNow();
                }
            };

            $scope.getExercisesPaginated = function(pageno) {
                centerModeApi.getExercises($scope.teacher._id, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage
                }).then(function(response) {
                    $scope.exercises = response.data;
                    $location.search('page', pageno);
                });
            };

            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                switch (type) {
                    case 'explore-sortby-recent':
                        $scope.orderInstance = 'dateCreated';
                        $scope.reverseOrder = true;
                        break;
                    case 'email':
                        $scope.orderInstance = 'email';
                        $scope.reverseOrder = false;
                        break;
                    case 'name':
                        $scope.orderInstance = 'firstName';
                        $scope.reverseOrder = false;
                        break;
                    case 'surname':
                        $scope.orderInstance = 'lastName';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_groups':
                        $scope.orderInstance = 'groups';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_students':
                        $scope.orderInstance = 'students';
                        $scope.reverseOrder = false;
                        break;
                }
            };

            $scope.sortInstancesByGroup = function() {
            };

            $scope.newGroup = function() {
                centerModeService.newGroup($scope.teacher._id || $scope.common.user._id, $scope.center._id)
                    .then(function() {
                        _getGroups();
                    });
            };

            $scope.newTeacher = function() {
                var confirmAction = function() {
                        var teachers = _.pluck(modalOptions.newTeachersModel, 'text');
                        if (teachers.length > 0) {
                            centerModeApi.addTeachers(teachers, $scope.center._id).then(function(response) {
                                if (response.data.teachersNotAdded) {
                                    commonModals.noAddTeachers(response.data.teachersNotAdded, response.data.teachersAdded.length);
                                }
                                if (response.data.teachersAdded) {
                                    _.forEach(response.data.teachersAdded, function(teacher) {
                                        $scope.teachers.push(teacher);
                                    });
                                }
                            }).catch(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_addTeacher-Error',
                                    id: 'addTeacher',
                                    type: 'error'
                                });
                            });
                        }
                        newTeacherModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'newTeacher_modal_title',
                    confirmButton: 'newTeacher_modal_aceptButton',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/centerMode/newTeacher.html',
                    modalButtons: true,
                    newTeachersModel: []
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.registerInGroup = function() {
                function confirmAction(groupId) {
                    centerModeApi.registerInGroup(groupId).then(function() {
                        currentModal.close();
                        _getGroups();
                        _getTasks();
                    }).catch(function() {
                        modal.input.showError = true;
                    });
                }

                var modalOptions = $rootScope.$new(),
                    modal = _.extend(modalOptions, {
                        title: 'centerMode_modal_registerInGroupTitle',
                        contentTemplate: 'views/modals/input.html',
                        mainText: 'centerMode_modal_registerInGroupInfo',
                        modalInput: true,
                        secondaryText: false,
                        input: {
                            id: 'groupId',
                            name: 'groupId',
                            placeholder: 'centerMode_modal_groupIdPlaceholder',
                            errorText: 'Este ID no existe o no está disponible para registrarse en estos momentos.',
                            showError: false
                        },
                        confirmButton: 'centerMode_button_registerInGroup',
                        condition: function() {
                            return this.input.value;
                        },
                        rejectButton: 'modal-button-cancel',
                        confirmAction: confirmAction,
                        modalButtons: true
                    });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input modal--register-in-group',
                    scope: modalOptions

                });
            };

            function _checkUrl() {
                $scope.common.urlType = $routeParams.type;
                switch ($scope.common.urlType) {
                    case 'center':
                        _getCenter();
                        break;
                    case 'center-teacher':
                    case 'teacher':
                        _getTeacher($routeParams.id);
                        break;
                    case 'group':
                        if ($scope.urlSubType && $scope.urlSubType === 'student') {
                            _getTasks($routeParams.id, $routeParams.subId);
                        } else {
                            _getGroup($routeParams.id);
                            _getTasks($routeParams.id);
                        }
                        break;
                    case 'student':
                        _getGroups();
                        _getTasks();
                        break;
                    case 'exercise-info':
                        _getExercise($routeParams.id);
                        _getTasksByExercise($routeParams.id);
                        _getGroups($routeParams.id);
                        break;
                }
            }

            function _closeGroupAction() {
                $scope.classStateCheck = false;
                $scope.group.status = 'closed';
                centerModeApi.updateGroup($scope.group).then(function() {
                    alertsService.add({
                        text: 'centerMode_alert_closeGroup',
                        id: 'closeGroup',
                        type: 'ok',
                        time: 5000
                    });
                }).catch(function() {
                    alertsService.add({
                        text: 'centerMode_alert_closeGroup-Error',
                        id: 'closeGroup',
                        type: 'ko'
                    });
                });
                currentModal.close();
            }

            function _getCenter() {
                centerModeApi.getMyCenter().then(function(response) {
                    $scope.center = response.data;
                    _getTeachers($scope.center._id);
                });

            }

            function _getExercise(exerciseId) {
                exerciseApi.get(exerciseId).then(function(response) {
                    $scope.exercise = response.data;
                });
            }

            function _getExercisesCount() {
                centerModeApi.getExercisesCount($scope.teacher._id, {}).then(function(response) {
                    $scope.exercisesCount = response.data.count;
                });
            }

            function _getGroup(groupId) {
                centerModeApi.getGroup(groupId).then(function(response) {
                    $scope.secondaryBreadcrumb = true;
                    $scope.group = response.data;
                    $scope.students = $scope.group.students;
                    $scope.classStateCheck = $scope.group.status === 'open';
                });
            }

            function _getGroups(exerciseId) {
                if (exerciseId) {
                    centerModeApi.getGroupsByExercise(exerciseId).then(function(response) {
                        $scope.groups = response.data;
                    });
                } else {
                    var teacherId;
                    if ($scope.teacher._id !== $scope.common.user._id) {
                        teacherId = $scope.teacher._id;
                    }
                    centerModeApi.getGroups(teacherId, $scope.center._id).then(function(response) {
                        $scope.groups = response.data;
                    });
                }
            }

            function _getTasks(groupId, studentId) {
                exerciseApi.getTasks(groupId, studentId).then(function(response) {
                    $scope.exercises = response.data;
                    if ($scope.urlSubType === 'student') {
                        $scope.tertiaryBreadcrumb = true;
                        $scope.tasks = response.data.tasks;
                        $scope.group = response.data.group;
                        $scope.student = response.data.student;
                    }
                });
            }

            function _getTasksByExercise(exerciseId) {
                exerciseApi.getTasksByExercise(exerciseId).then(function(response) {
                    response.data.forEach(function(task) {
                        var taskId = task._id;
                        _.extend(task, task.student);
                        if (task.status === 'pending' && $scope.getDatetime(task.endDate, true)) {
                            task.status = 'notDelivered';
                        }
                        task._id = taskId;
                    });
                    $scope.tasks = response.data;
                });
            }

            function _getTeacher(teacherId) {
                if (teacherId) {
                    centerModeApi.getTeacher(teacherId, $scope.center._id).then(function(response) {
                        $scope.secondaryBreadcrumb = true;
                        $scope.teacher = _.extend($scope.teacher, response.data);
                        _getExercisesCount();
                        _getGroups();
                        _getExercises();
                    });
                } else {
                    $scope.secondaryBreadcrumb = true;
                    _getExercisesCount();
                    _getGroups();
                    _getExercises();
                }
            }

            function _getTeachers(centerId) {
                centerModeApi.getTeachers(centerId).then(function(response) {
                    $scope.teachers = response.data;
                });
            }

            function _getExercises() {
                if ($routeParams.page) {
                    $scope.getExercisesPaginated($routeParams.page);
                    $scope.pagination.current = $routeParams.page;
                } else {
                    $scope.getExercisesPaginated($scope.pageno);
                }
            }

            $scope.common.itsUserLoaded().then(function() {
                centerModeApi.getMyCenter().then(function(response) { //todo delete
                    $scope.center = response.data;
                    _checkUrl();
                });
            });

            $window.onfocus = function() {
                if ($routeParams.type === 'teacher') {
                    $scope.$apply(function() {
                        $scope.timestamp = Date.now();
                    });
                    if (JSON.parse(localStorage.exercisesChange) && $scope.common.itsUserLoaded()) {
                        localStorage.exercisesChange = false;
                        _getTeacher();
                    }
                }
            };

            $scope.$on('$destroy', function() {
                $window.onfocus = null;
            });
        });
})();
