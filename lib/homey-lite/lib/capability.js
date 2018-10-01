'use strict';

let capabilitiesCache;

class Capability {

    constructor( capability ) {
        this._capability = capability;
    }


    static list() {

        if( capabilitiesCache ) return capabilitiesCache;

        const capabilities = require('../assets/capability/capabilities.json');
        capabilitiesCache = capabilities.reduce((obj, capabilityId) => {

            let capability,methods = {};

            capability = require(`../assets/capability/capabilities/${capabilityId}.json`);
            capability = Capability._composeCapability( capabilityId, capability );

            methods = require(`../assets/capability/methods/${capabilityId}.json`);

            obj[capabilityId] = Object.assign(capability,methods);

            return obj;
        }, {});

        return capabilitiesCache;
    }



    static get(id) {

        const capabilities = Capability.list();

        const capability = capabilities[id];

        console.log(id);
        console.log(capability);

        if( !capability ) {
            throw new Error('invalid_capability');
        }

        return capability;
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
    static methods(id) {


        const capability = Capability.get(id);

        if( ! capability.methods ) {
            throw new Error('invalid_capability_method');
        }

        return capability.methods;
    }
}

module.exports = Capability;