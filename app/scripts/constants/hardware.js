'use strict';
/* jshint quotmark: false */
/**
 * @ngdoc constant
 * @name bitbloqApp.hardwareConstants
 *
 */
angular.module('bitbloqApp')
    .constant("hardwareConstants", {
        "boards": [{
            "name": "bq ZUM",
            "id": "bqZUM",
            "mcu": "bt328",
            "vendorIds": ["0x403"],
            "productIds": ["0x6001"],
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 37
                },
                "analog": {
                    "w": 9,
                    "h": 37
                },
                "serial": {
                    "w": 15,
                    "h": 35
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.435,
                    "y": 0.175,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd00"
                }, {
                    "x": 0.470,
                    "y": 0.175,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd01"
                }, {
                    "x": 0.507,
                    "y": 0.175,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd02"
                }, {
                    "x": 0.539,
                    "y": 0.175,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd03"
                }, {
                    "x": 0.575,
                    "y": 0.175,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd04"
                }, {
                    "x": 0.609,
                    "y": 0.175,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd05"
                }, {
                    "x": 0.662,
                    "y": 0.175,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd06"
                }, {
                    "x": 0.698,
                    "y": 0.175,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd07"
                }, {
                    "x": 0.733,
                    "y": 0.175,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd08"
                }, {
                    "x": 0.767,
                    "y": 0.175,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd09"
                }, {
                    "x": 0.802,
                    "y": 0.175,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd10"
                }, {
                    "x": 0.837,
                    "y": 0.175,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd11"
                }, {
                    "x": 0.871,
                    "y": 0.175,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd12"
                }, {
                    "x": 0.907,
                    "y": 0.175,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bd13"
                }],
                "analog": [{
                    "x": 0.844,
                    "y": 0.785,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba00"
                }, {
                    "x": 0.81,
                    "y": 0.785,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba01"
                }, {
                    "x": 0.775,
                    "y": 0.785,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba02"
                }, {
                    "x": 0.741,
                    "y": 0.785,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba03"
                }, {
                    "x": 0.705,
                    "y": 0.785,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba04"
                }, {
                    "x": 0.67,
                    "y": 0.785,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ba05"
                }],
                "serial": [{
                    "x": 0.078,
                    "y": 0.505,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53bc05"
                }],
                "i2c-4": [{
                    "x": 0.81,
                    "y": 0.734,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53b201"
                }, {
                    "x": 0.869,
                    "y": 0.913,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53b203"
                }],
                "i2c-5": [{
                    "x": 0.844,
                    "y": 0.734,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53b200"
                }, {
                    "x": 0.903,
                    "y": 0.913,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53b202"
                }]
            }
        }, {
            "name": "Freaduino UNO",
            "id": "FreaduinoUNO",
            "mcu": "uno",
            "vendorIds": ["0x2341"],
            "productIds": ["0x1"],
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 37
                },
                "analog": {
                    "w": 9,
                    "h": 37
                },
                "serial": {
                    "w": 25,
                    "h": 37
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.476,
                    "y": 0.172,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd00"
                }, {
                    "x": 0.507,
                    "y": 0.172,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd01"
                }, {
                    "x": 0.541,
                    "y": 0.172,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd02"
                }, {
                    "x": 0.575,
                    "y": 0.172,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd03"
                }, {
                    "x": 0.607,
                    "y": 0.172,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd04"
                }, {
                    "x": 0.639,
                    "y": 0.172,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd05"
                }, {
                    "x": 0.672,
                    "y": 0.172,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd06"
                }, {
                    "x": 0.702,
                    "y": 0.172,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd07"
                }, {
                    "x": 0.738,
                    "y": 0.172,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd08"
                }, {
                    "x": 0.77,
                    "y": 0.172,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd09"
                }, {
                    "x": 0.807,
                    "y": 0.172,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd10"
                }, {
                    "x": 0.838,
                    "y": 0.172,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd11"
                }, {
                    "x": 0.87,
                    "y": 0.172,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd12"
                }, {
                    "x": 0.904,
                    "y": 0.172,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fd13"
                }],
                "analog": [{
                    "x": 0.661,
                    "y": 0.79,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa00"
                }, {
                    "x": 0.692,
                    "y": 0.79,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa01"
                }, {
                    "x": 0.728,
                    "y": 0.79,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa02"
                }, {
                    "x": 0.76,
                    "y": 0.79,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa03"
                }, {
                    "x": 0.793,
                    "y": 0.79,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa04"
                }, {
                    "x": 0.825,
                    "y": 0.79,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fa05"
                }],
                "serial": [{
                    "x": 0.058,
                    "y": 0.218,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53fc05"
                }],
                "i2c-4": [{
                    "x": 0.793,
                    "y": 0.734,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53f201"
                }, {
                    "x": 0.879,
                    "y": 0.923,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53f203"
                }],
                "i2c-5": [{
                    "x": 0.825,
                    "y": 0.734,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53f200"
                }, {
                    "x": 0.913,
                    "y": 0.923,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53f202"
                }]
            }
        }, {
            "name": "Arduino UNO",
            "id": "ArduinoUNO",
            "mcu": "uno",
            "vendorIds": ["0x2341"],
            "productIds": ["0x43"],
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }, {
            "name": "MCore",
            "id": "mcore",
            "mcu": "uno",
            "vendorIds": [""],
            "productIds": [""],
            "underDevelopment": true,
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }, {
            "name": "Me Auriga",
            "id": "meauriga",
            "mcu": "mega",
            "vendorIds": [""],
            "productIds": [""],
            "underDevelopment": true,
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }, {
            "name": "Me Orion",
            "id": "meorion",
            "mcu": "uno",
            "vendorIds": [""],
            "productIds": [""],
            "underDevelopment": true,
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }, {
            "name": "Arduino MEGA 2560",
            "id": "ArduinoMEGA2560",
            "mcu": "mega",
            "underDevelopment": true,
            "vendorIds": ["0x2341"],
            "productIds": ["0x10", "0x0042", "0x6001", "0x0010"],
            "pinSize": {
                "digital": {
                    "w": 12,
                    "h": 13
                },
                "analog": {
                    "w": 12,
                    "h": 13
                },
                "serial": {
                    "w": 80,
                    "h": 57
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.330,
                    "y": 0.05,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.3505,
                    "y": 0.05,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.374,
                    "y": 0.05,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.396,
                    "y": 0.05,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.419,
                    "y": 0.05,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.441,
                    "y": 0.05,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.4861,
                    "y": 0.05,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.508,
                    "y": 0.05,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.531,
                    "y": 0.05,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.553,
                    "y": 0.05,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.576,
                    "y": 0.05,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.598,
                    "y": 0.05,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.62,
                    "y": 0.05,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.643,
                    "y": 0.05,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }, {
                    "x": 0.6872,
                    "y": 0.05,
                    "name": "14",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad14"
                }, {
                    "x": 0.71,
                    "y": 0.05,
                    "name": "15",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad15"
                }, {
                    "x": 0.732,
                    "y": 0.05,
                    "name": "16",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad16"
                }, {
                    "x": 0.755,
                    "y": 0.05,
                    "name": "17",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad17"
                }, {
                    "x": 0.7762,
                    "y": 0.05,
                    "name": "18",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad18"
                }, {
                    "x": 0.8,
                    "y": 0.05,
                    "name": "19",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad19"
                }, {
                    "x": 0.822,
                    "y": 0.05,
                    "name": "20",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad20"
                }, {
                    "x": 0.8447,
                    "y": 0.05,
                    "name": "21",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad21"
                }, {
                    "x": 0.911,
                    "y": 0.104,
                    "name": "22",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad22"
                }, {
                    "x": 0.933,
                    "y": 0.104,
                    "name": "23",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad23"
                }, {
                    "x": 0.911,
                    "y": 0.15,
                    "name": "24",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad24"
                }, {
                    "x": 0.933,
                    "y": 0.15,
                    "name": "25",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad25"
                }, {
                    "x": 0.911,
                    "y": 0.194,
                    "name": "26",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad26"
                }, {
                    "x": 0.933,
                    "y": 0.194,
                    "name": "27",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad27"
                }, {
                    "x": 0.911,
                    "y": 0.24,
                    "name": "28",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad28"
                }, {
                    "x": 0.933,
                    "y": 0.24,
                    "name": "29",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad29"
                }, {
                    "x": 0.911,
                    "y": 0.29,
                    "name": "30",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad30"
                }, {
                    "x": 0.933,
                    "y": 0.29,
                    "name": "31",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad31"
                }, {
                    "x": 0.911,
                    "y": 0.335,
                    "name": "32",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad32"
                }, {
                    "x": 0.933,
                    "y": 0.335,
                    "name": "33",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad33"
                }, {
                    "x": 0.911,
                    "y": 0.38,
                    "name": "34",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad34"
                }, {
                    "x": 0.933,
                    "y": 0.38,
                    "name": "35",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad35"
                }, {
                    "x": 0.911,
                    "y": 0.43,
                    "name": "36",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad36"
                }, {
                    "x": 0.933,
                    "y": 0.43,
                    "name": "37",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad37"
                }, {
                    "x": 0.911,
                    "y": 0.475,
                    "name": "38",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad38"
                }, {
                    "x": 0.933,
                    "y": 0.475,
                    "name": "39",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad39"
                }, {
                    "x": 0.911,
                    "y": 0.52,
                    "name": "40",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad40"
                }, {
                    "x": 0.933,
                    "y": 0.52,
                    "name": "41",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad41"
                }, {
                    "x": 0.911,
                    "y": 0.565,
                    "name": "42",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad42"
                }, {
                    "x": 0.933,
                    "y": 0.565,
                    "name": "43",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad43"
                }, {
                    "x": 0.911,
                    "y": 0.61,
                    "name": "44",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad44"
                }, {
                    "x": 0.933,
                    "y": 0.61,
                    "name": "45",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad45"
                }, {
                    "x": 0.911,
                    "y": 0.66,
                    "name": "46",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad46"
                }, {
                    "x": 0.933,
                    "y": 0.66,
                    "name": "47",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad47"
                }, {
                    "x": 0.911,
                    "y": 0.705,
                    "name": "48",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad48"
                }, {
                    "x": 0.933,
                    "y": 0.705,
                    "name": "49",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad49"
                }, {
                    "x": 0.911,
                    "y": 0.75,
                    "name": "50",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad50"
                }, {
                    "x": 0.933,
                    "y": 0.75,
                    "name": "51",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad51"
                }, {
                    "x": 0.911,
                    "y": 0.795,
                    "name": "52",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad52"
                }, {
                    "x": 0.933,
                    "y": 0.795,
                    "name": "53",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad53"
                }],
                "analog": [{
                    "x": 0.532,
                    "y": 0.945,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.555,
                    "y": 0.945,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.576,
                    "y": 0.945,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.599,
                    "y": 0.945,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.62,
                    "y": 0.945,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.643,
                    "y": 0.945,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }, {
                    "x": 0.666,
                    "y": 0.945,
                    "name": "A6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa06"
                }, {
                    "x": 0.688,
                    "y": 0.945,
                    "name": "A7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa07"
                }, {
                    "x": 0.732,
                    "y": 0.945,
                    "name": "A8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa08"
                }, {
                    "x": 0.755,
                    "y": 0.945,
                    "name": "A9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa09"
                }, {
                    "x": 0.776,
                    "y": 0.945,
                    "name": "A10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa10"
                }, {
                    "x": 0.8,
                    "y": 0.945,
                    "name": "A11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa11"
                }, {
                    "x": 0.822,
                    "y": 0.945,
                    "name": "A12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa12"
                }, {
                    "x": 0.845,
                    "y": 0.945,
                    "name": "A13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa13"
                }, {
                    "x": 0.866,
                    "y": 0.945,
                    "name": "A14",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa14"
                }, {
                    "x": 0.889,
                    "y": 0.945,
                    "name": "A15",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa15"
                }],
                "serial": [{
                    "x": 0.095,
                    "y": 0.2943,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edadserial1"
                }],
                "i2c-4": [{
                    "x": 0.822,
                    "y": 0.05,
                    "name": "20-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a220"
                }],
                "i2c-5": [{
                    "x": 0.8447,
                    "y": 0.05,
                    "name": "21-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a221"
                }]
            }
        }, {
            "name": "Arduino Leonardo",
            "id": "ArduinoLeonardo",
            "mcu": "leonardo",
            "underDevelopment": true,
            "vendorIds": ["0x2341"],
            "productIds": ['0x0036', '0x8036', '0x800c'],
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }, {
            "name": "Arduino Nano",
            "id": "ArduinoNano",
            "mcu": "nano",
            "underDevelopment": true,
            "vendorIds": ["0x2341"],
            "productIds": ['0x6001', '0x7523'],
            "pinSize": {
                "digital": {
                    "w": 9,
                    "h": 15
                },
                "analog": {
                    "w": 9,
                    "h": 15
                },
                "serial": {
                    "w": 33,
                    "h": 66
                },
                "i2c-4": {
                    "w": 9,
                    "h": 9
                },
                "i2c-5": {
                    "w": 9,
                    "h": 9
                }
            },
            "pins": {
                "digital": [{
                    "x": 0.478,
                    "y": 0.098,
                    "name": "13",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad00"
                }, {
                    "x": 0.508,
                    "y": 0.098,
                    "name": "12",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad01"
                }, {
                    "x": 0.545,
                    "y": 0.098,
                    "name": "11",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad02"
                }, {
                    "x": 0.58,
                    "y": 0.098,
                    "name": "10",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad03"
                }, {
                    "x": 0.615,
                    "y": 0.098,
                    "name": "9",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad04"
                }, {
                    "x": 0.649,
                    "y": 0.098,
                    "name": "8",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad05"
                }, {
                    "x": 0.695,
                    "y": 0.098,
                    "name": "7",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad06"
                }, {
                    "x": 0.73,
                    "y": 0.098,
                    "name": "6",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad07"
                }, {
                    "x": 0.765,
                    "y": 0.098,
                    "name": "5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad08"
                }, {
                    "x": 0.795,
                    "y": 0.098,
                    "name": "4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad9"
                }, {
                    "x": 0.832,
                    "y": 0.098,
                    "name": "3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad10"
                }, {
                    "x": 0.869,
                    "y": 0.098,
                    "name": "2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad11"
                }, {
                    "x": 0.9,
                    "y": 0.098,
                    "name": "1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad12"
                }, {
                    "x": 0.935,
                    "y": 0.098,
                    "name": "0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ad13"
                }],
                "analog": [{
                    "x": 0.763,
                    "y": 0.92,
                    "name": "A0",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa00"
                }, {
                    "x": 0.795,
                    "y": 0.92,
                    "name": "A1",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa01"
                }, {
                    "x": 0.83,
                    "y": 0.92,
                    "name": "A2",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa02"
                }, {
                    "x": 0.862,
                    "y": 0.92,
                    "name": "A3",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa03"
                }, {
                    "x": 0.895,
                    "y": 0.92,
                    "name": "A4",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa04"
                }, {
                    "x": 0.935,
                    "y": 0.92,
                    "name": "A5",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53aa05"
                }],
                "serial": [{
                    "x": 0.045,
                    "y": 0.315,
                    "name": "serial",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53ac05"
                }],
                "i2c-4": [{
                    "x": 0.903,
                    "y": 0.925,
                    "name": "A4-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a201"
                }],
                "i2c-5": [{
                    "x": 0.933,
                    "y": 0.925,
                    "name": "A5-H",
                    "uid": "6be0dd9d-2e52-4b7d-9dfc-c9edad53a200"
                }]
            }
        }],
        "components": {
            "leds": [{
                "id": "led",
                "width": 55,
                "height": 83,
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }],
            "rgbs": [{
                "id": "RGBled",
                "width": 67,
                "height": 79,
                "pins": {
                    "digital": [
                        "b",
                        "g",
                        "r"
                    ]
                }
            }],
            "sensors": [{
                "id": "us",
                "type": "US",
                "width": 120,
                "height": 79,
                "dataReturnType": "float",
                "pins": {
                    "digital": [
                        "trigger",
                        "echo"
                    ]
                }
            }, {
                "id": "button",
                "type": "digital",
                "width": 90,
                "height": 73,
                "dataReturnType": "float",
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }, {
                "id": "limitswitch",
                "type": "digital",
                "width": 100,
                "height": 92,
                "dataReturnType": "float",
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }, {
                "id": "encoder",
                "type": "encoder",
                "width": 74,
                "height": 84,
                "dataReturnType": "float",
                "pin": {
                    "sb": "2",
                    "sa": "3"
                },
                "pins": {
                    "digital": [
                        "k",
                        "sa",
                        "sb"
                    ]
                }
            }, {
                "id": "sound",
                "type": "digital",
                "width": 100,
                "height": 102,
                "dataReturnType": "float",
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }, {
                "id": "buttons",
                "type": "ButtonPad",
                "width": 165,
                "height": 120,
                "dataReturnType": "char",
                "pins": {
                    "analog": [
                        "s"
                    ]
                }
            }, {
                "id": "irs",
                "type": "digital",
                "width": 90,
                "height": 77,
                "dataReturnType": "float",
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }, {
                "id": "irs2",
                "type": "LineFollower",
                "width": 97,
                "height": 88,
                "dataReturnType": "float *",
                "pins": {
                    "digital": [
                        "s1",
                        "s2"
                    ]
                }
            }, {
                "id": "joystick",
                "type": "Joystick",
                "width": 100,
                "height": 102,
                "dataReturnType": "float *",
                "pins": {
                    "analog": [
                        "x",
                        "y"
                    ],
                    "digital": [
                        "k"
                    ]
                }
            }, {
                "id": "ldrs",
                "type": "analog",
                "width": 90,
                "height": 65,
                "dataReturnType": "float",
                "pins": {
                    "analog": [
                        "s"
                    ]
                }
            }, {
                "id": "pot",
                "type": "analog",
                "width": 74,
                "height": 101,
                "dataReturnType": "float",
                "pins": {
                    "analog": [
                        "s"
                    ]
                }
            }],
            "clocks": [{
                "id": "rtc",
                "type": "analog",
                "width": 128,
                "height": 93,
                "pin": {
                    "sda": "a4",
                    "scl": "a5"
                },
                "pins": {
                    "i2c-4": [
                        "sda"
                    ],
                    "i2c-5": [
                        "scl"
                    ]
                }
            }],
            "hts221": [{
                "id": "hts221",
                "type": "digital",
                "width": 107,
                "height": 113,
                "pin": {
                    "sda": "a4",
                    "scl": "a5"
                },
                "pins": {
                    "i2c-4": [
                        "sda"
                    ],
                    "i2c-5": [
                        "scl"
                    ]
                }
            }],
            "buzzers": [{
                "id": "buzz",
                "type": "digital",
                "width": 85,
                "height": 80,
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }],
            "servos": [{
                "id": "servo",
                "width": 125,
                "height": 106,
                "pins": {
                    "digital": [
                        "s"
                    ]
                },
                "oscillator": false
            }],
            "continuousServos": [{
                "id": "servocont",
                "width": 125,
                "height": 106,
                "pins": {
                    "digital": [
                        "s"
                    ]
                }
            }],
            "oscillators": [{}],
            "lcds": [{
                "id": "lcd",
                "width": 170,
                "height": 93,
                "pin": {
                    "sda": "a4",
                    "scl": "a5"
                },
                "pins": {
                    "i2c-4": [
                        "sda"
                    ],
                    "i2c-5": [
                        "scl"
                    ]
                }
            }],
            "serialElements": [{
                "id": "bt",
                "baudRate": "9600",
                "width": 115,
                "height": 88,
                "pins": {
                    "digital": [
                        "rx",
                        "tx"
                    ]
                }
            }, {
                "id": "sp",
                "baudRate": "9600",
                "width": 115,
                "height": 71,
                "pin": {
                    "s": "serial"
                },
                "pins": {
                    "serial": [
                        "s"
                    ]
                }
            }, {
                "id": "device",
                "baudRate": "9600",
                "dragType": "btComponent",
                "width": 74,
                "height": 102,
                "pins": {}
            }]
        },
        "robots": [{
            "id": "zowi",
            "name": "Zowi",
            "board": "Arduino UNO",
            "width": 75,
            "height": 86,
            "components": ['buzz']
        }, {
            "id": "evolution",
            "name": "Evolution",
            "board": "bq ZUM",
            "width": 75,
            "height": 86
        }, {
            "id": "mbot",
            "name": "mBot",
            "board": "Arduino UNO",
            "width": 75,
            "height": 86
        }, {
            "id": "rangerlandraider",
            "name": "mRanger Land Raider",
            "board": "Arduino MEGA 2560",
            "underDevelopment": true,
            "width": 75,
            "height": 86
        }, {
            "id": "rangerraptor",
            "name": "mRanger Raptor",
            "board": "Arduino MEGA 2560",
            "underDevelopment": true,
            "width": 75,
            "height": 86
        }, {
            "id": "rangernervousbird",
            "name": "mRanger Nervous bird",
            "board": "Arduino MEGA 2560",
            "underDevelopment": true,
            "width": 75,
            "height": 86
        }, {
            "id": "startertank",
            "name": "Starter kit Modo tanke",
            "underDevelopment": true,
            "board": "Arduino UNO",
            "width": 75,
            "height": 86
        }, {
            "id": "starterthreewheels",
            "name": "Starter kit Modo 3 ruedas",
            "underDevelopment": true,
            "board": "Arduino UNO",
            "width": 75,
            "height": 86
        }],

        "viewerSensors": [
            "encoder",
            "hts221",
            "pot",
            "ldrs",
            "sound",
            "us",
            "irs"
        ]
    });