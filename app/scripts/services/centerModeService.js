'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.centerModeService
 * @description
 * # centerModeService
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('centerModeService', function($log, $q, $rootScope, _, centerModeApi, ngDialog) {

        var exports = {};

        exports.newGroup = function(teacherId, centerId) {
            var def = $q.defer();

            function confirmAction(name) {
                var accessId = Date.now();
                centerModeApi.createGroup(name, accessId, teacherId, centerId).then(function(newGroup) {
                    modalOptions.title = name;
                    modalOptions.mainText = 'centerMode_modal_accessIdInfo';
                    modalOptions.confirmButton = null;
                    modalOptions.rejectButton = 'close';
                    modalOptions.modalInput = false;
                    modalOptions.secondaryText = accessId;
                    modalOptions.modalDropdown = null;
                    def.resolve(newGroup);
                });
            }

            var modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'centerMode_modal_createGroupTitle',
                contentTemplate: 'views/modals/input.html',
                mainText: 'centerMode_modal_createGroupInfo',
                modalInput: true,
                secondaryText: false,
                input: {
                    id: 'groupName',
                    name: 'groupName',
                    placeholder: 'centerMode_modal_createGroupPlaceholder'
                },
                condition: function() {
                    return this.input.value;
                },
                confirmButton: 'centerMode_button_createGroup',
                rejectButton: 'modal-button-cancel',
                confirmAction: confirmAction,
                modalButtons: true
            });

            var centerArray;
            if (!centerId) {
                centerArray = [];
                centerModeApi.getMyCentersAsTeacher().then(function(response) {
                    centerArray = response.data;
                    _.extend(modalOptions, {
                        modalDropdown: true,
                        modaloptions: centerArray,
                        optionsClick: function(selected) {
                            centerId = selected._id;
                        },
                        headingOptions: 'centerMode_createGroup_selectCenter'
                    });
                    ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--input',
                        scope: modalOptions

                    });
                });
            } else {
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            }


            return def.promise;
        };


        return exports;
    });
