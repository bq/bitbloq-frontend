/*jshint bitwise: false*/
'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.alerts
 * @description
 * # Alerts service
 */
angular.module('bitbloqApp')
    .service('alertsService', function($timeout, _, $rootScope) {
        var exports = {},
            alerts = [],
            alertTimeout,
            i = 0,
            options = {
                maxSimultaneousAlerts: 5
            };

        var _removeAlert = function(propertyName, propertyValue) {
            var removedAlert;

            removedAlert = _.remove(alerts, function(al) {
                return al[propertyName] === propertyValue;
            });

            if (removedAlert.length > 0) {
                // if (alerts.length === 0) {
                //     i = 0;
                // }

                if (!$rootScope.$$phase) {
                    $rootScope.$digest();
                }
            }

        };

        var _handlePreCloseAlert = function(evt) {
            if (evt) {
                var $element = $(evt.currentTarget).parent();
                $element.addClass('alert--removed');
            }
            if (alertTimeout) {
                $timeout.cancel(alertTimeout);
            }
        };

        exports.isVisible = function(propertyName, propertyValue) {
            return !!_.find(alerts, function(item) {
                return item[propertyName] === propertyValue;
            });
        };

        exports.getInstance = function() {
            if (!alerts) {
                alerts = [];
            }
            return alerts;
        };

        /**
         * Params
         * @param {[type]} text           Key of translated text to show
         * @param {[type]} id             Alert ID
         * @param {[type]} type           Type of alert Default "info"
         * @param {[type]} time           Time : time to autoclose the alert, default "infinite"
         * @param {[type]} value          Value: data extra
         * @param {[type]} preIcon
         * @param {[type]} postIcon
         * @param {[type]} linkText       Text in the end of the alert with link
         * @param {[type]} link           Function to execute when click the link
         * @param {[type]} linkParams     Params for the function in the link
         * @param {[type]} closeFunction  Function to launch on close
         * @param {[type]} closeParams    Params for the function in the link
         * @param {[type]} translatedText ??
         */
        //exports.add = function(text, id, type, time, value, preIcon, postIcon, linkText, link, linkParams, closeFunction, closeParams, translatedText) {
        exports.add = function(params) {

            i += 1;

            var alert = {
                id: params.id,
                text: params.text,
                uid: Date.now() * Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
                type: params.type || 'info',
                time: params.time || 'infinite',
                domClass: null,
                preIcon: params.preIcon || false,
                postIcon: params.postIcon || false,
                value: params.value,
                index: i,
                linkText: params.linkText,
                linkAction: params.link,
                linkParams: params.linkParams,
                close: exports.close,
                closeFunction: params.closeFunction,
                closeParams: params.closeParams,
                translatedText: params.translatedText
            };

            switch (params.type) {
                case 'info':
                    alert.domClass = 'alert--info';
                    break;
                case 'confirm':
                    alert.domClass = 'alert--confirm';
                    break;
                case 'error':
                    alert.domClass = 'alert--error';
                    break;
                case 'warning':
                    alert.domClass = 'alert--warning';
                    break;
                default:
                    alert.domClass = 'alert--info';
            }

            _removeAlert('id', alert.id);

            if (alerts.length === options.maxSimultaneousAlerts) {
                alerts.pop();
            }

            if (alert.time !== 'infinite') {
                alertTimeout = $timeout(function() {
                    _removeAlert('uid', alert.uid);
                    if (alert.closeFunction) {
                        alert.closeFunction(params.closeParams);
                    }
                }, alert.time);
            }

            alerts.unshift(alert);
            if (!$rootScope.$$phase) {
                $rootScope.$apply();
            }

            return alert.uid;

        };

        /**
         * [close description]
         * @param  {[object]} evt  [event triggered when clicking the close button]
         */
        exports.close = function(uid, evt) {
            _handlePreCloseAlert(evt);
            _removeAlert('uid', uid);
        };

        /**
         * [close description]
         * @param {string} tag [use tag as id to differentiate from uid]
         * @param  {[object]} evt  [event triggered when clicking the close button]
         */
        exports.closeByTag = function(tag, evt) {
            _handlePreCloseAlert(evt);
            _removeAlert('id', tag);
        };

        return exports;

    });

/* Alerts */
// Alert Example:
// <div class="alerts--container">
//     <div ng-repeat="alert in alerts.getAlerts()" class="test" ng-style="{'margin-top': 50*$index+'px'}">
//         <div class="alert {{alert.domClass}}" id="{{alert.id}}">
//             <i ng-if="alert.preIcon">
//                 <svg class="svg-icon icon--preicon">
//                     <use xlink:href="{{'images/sprite.svg#'+alert.preIcon}}"></use>
//                 </svg>
//             </i>
//             <span>{{alert.text | translate}}</span>
//             <i ng-if="alert.postIcon">
//                 <svg class="svg-icon icon--postIcon">
//                     <use xlink:href="{{'images/sprite.svg#'+alert.postIcon}}"></use>
//                 </svg>
//             </i>
//             <div class="alert--close" ng-click="alerts.close(alert.uid, $event)">
//                 <svg class="svg-icon">
//                     <use xlink:href="images/sprite.svg#icon-close"></use>
//                 </svg>
//             </div>
//         </div>
//     </div>
// </div>
/* Trigger */
// alerts.alert(text, id, type, time)