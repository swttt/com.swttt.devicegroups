'use strict';

let capabilitiesCache = {};
    capabilitiesCache.list = false;
    capabilitiesCache.capabilities = false;
    capabilitiesCache.methods = false;

const path = './catalog';
const type = 'capabilities';


// @todo refactor - currently proof of concept
class Capability {


    static getCapabilitiesList() {

        if ( ! capabilitiesCache.list ) {
            capabilitiesCache.list = require(`${path}/${type}.json`);
        }

        return capabilitiesCache.list;
    }

    static getCapabilities() {

        if ( ! capabilitiesCache.capabilities ) {

            let capabilities = Capability.getCapabilitiesList();

            capabilitiesCache.capabilities = capabilities.reduce((obj, capabilityId) => {
                obj[capabilityId] = require(`${path}/${type}/${capabilityId}.json`);
                return obj;
            }, {});
        }

        return capabilitiesCache.capabilities;
    }


    static getCapability(id) {

        const capabilities = Capability.getCapabilities();

        if( ! capabilities[id] ) {
            throw new Error('invalid_capability ' + id);
        }

        return capabilities[id];
    }
}

module.exports = Capability;