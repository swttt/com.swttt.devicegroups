'use strict';
const Lite = require('../lite');

class Device extends Lite {

    static getClasses() {

        const deviceClasses = require('../../assets/device/classes.json');

        classesCache = deviceClasses.reduce((obj, classId) => {

            obj[classId] = require(`../../assets/device/classes/${classId}.json`);
            return obj;

        }, {});

        return classesCache;
    }

    static getClass(id) {

        const deviceClasses = Device.getClasses();
        const deviceClass = deviceClasses[id];

        if( !deviceClass ) {
            throw new Error('invalid_class');
        }

        return deviceClass;
    }
}

module.exports = Device;