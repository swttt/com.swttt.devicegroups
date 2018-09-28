let capabilities = {

    alarm_battery: {
        "type": "boolean",
        "title": {
            "en": "Battery Alarm",
            "nl": "Batterij alarm"
        },
        "desc": {
            "en": "True when there is a battery warning",
            "nl": "Geeft een batterijwaarschuwing"
        },
        "getable": true,
        "setable": false,
        "uiComponent": "battery",
    },
    onoff : {
        "type": "boolean",
        "title": {
            "en": "Turned on",
            "nl": "Aangezet"
        },
        "getable": true,
        "setable": true,
        "uiComponent": "toggle",
    },
    dim: {
        "type": "number",
        "title": {
            "en": "Dim level",
            "nl": "Dim niveau"
        },
        "chartType": "stepLine",
        "min": 0,
        "max": 1,
        "decimals": 2,
        "units": "%",
        "getable": true,
        "setable": true,
        "uiComponent": "slider",
    },
    measure_temperature: {
        "type": "number",
        "title": {
            "en": "Temperature",
            "nl": "Temperatuur"
        },
        "units": {
            "en": "°C"
        },
        "decimals": 2,
        "chartType": "spline",
        "getable": true,
        "setable": false,
        "uiComponent": "sensor",
    }
};

module.exports = capabilities;