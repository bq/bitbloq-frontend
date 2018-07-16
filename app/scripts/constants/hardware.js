'use strict';
/* jshint quotmark: false */
/**
 * @ngdoc constant
 * @name bitbloqApp.hardwareConstants
 *
 */
angular.module('bitbloqApp')
    .constant("hardwareConstants", {
        "viewerSensors": [
            "encoder",
            "hts221",
            "pot",
            "ldrs",
            "sound",
            "us",
            "us3",
            "irs",
            "button"
        ]
    });