const devices = require('./maps/devices.js');
const method = require('./maps/methods.js');
const capability = require('./maps/capabilities.js');


let groups = {
    onoff: {
        capability:  capability.onoff,
        default : method.min,
        methods : [
            method.none,
            method.any,
            method.all,
            method.mode,
        ]
    },
    dim: {
        capability: capability.dim,
        default: method.mean,
        methods: [
            method.none,
            method.mean,
            // method.median,
            method.min,
            method.max,
        ]
    },
    measure_temperature: {
        capability: capability.dim,
        default: method.max,
        methods: [
            method.none,
            method.mean,
            // method.median,
            method.min,
            method.max,
        ]
    }
};

module.exports.group = groups;
