'use strict';

let capabilitiesCache = {};
    capabilitiesCache.list = false;
    capabilitiesCache.capabilities = false;
    capabilitiesCache.methods = false;

const path = '../assets/capability';
const type = 'capabilities';


// @todo refactor - currently proof of concept
class Capability {

    constructor( capability ) {
        this._capability = capability;
    }


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

                let capability, methods;

                capability = require(`${path}/${type}/${capabilityId}.json`);
                capability = Capability._composeCapability( capabilityId, capability );

                methods = require(`${path}/methods/${capabilityId}.json`);

                obj[capabilityId] = Object.assign(capability,methods);

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


    static _composeCapability( capabilityId, capability ) {
        if( capability.flow ) console.warn(`Warning: using \`capability.flow\` (${capabilityId}), expected a \`capability.$flow\``);

        if( capability.$flow ) {

            ['triggers', 'conditions', 'actions'].forEach(type => {
                const cards = capability.$flow[type];

                if( !Array.isArray(cards) ) return;

                cards.forEach(card => {

                    if( Array.isArray(card.args) ) {
                        card.args.forEach(arg => {
                            // allow `"values": "$values"` to copy values from the capability
                            if( arg.type === 'dropdown' ) {
                                if( arg.values === '$values' ) {
                                    arg.values = capability.values;
                                }
                            }
                        });
                    }

                    if( Array.isArray(card.tokens) ) {

                        card.tokens.forEach(token => {

                            if( token.name === '$id' ) {
                                token.name = capability.id;
                            }

                            if( token.type === '$type' ) {
                                token.type = capability.type;
                            }

                            if( token.title === '$title' ) {
                                token.title = capability.title;
                            }

                        });
                    }
                });
            })
        }

        return capability;
    }


    /**
     * Returns the capabilities a category has assigned to them.
     *
     * Used to help device-groups show capabilities in filtered  by category.
     *
     * Note : how this is using a different set of files, this was to all
     * new added to homey-ib to be more easily merged in to our 'classes'
     *
     * @param id
     * @returns {*}
     */
    static getMethods(id) {

        const capability = Capability.getCapability(id);

        if( ! capability.methods ) {
            throw new Error('invalid_capability_method');
        }

        return capability.methods;
    }
}

module.exports = Capability;