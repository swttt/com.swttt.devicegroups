'use strict';
const Lite = require('../lite');

let capabilitiesCache;

class Capability {

    constructor( capability ) {
        this._capability = capability;
    }


    static getJSONSchema() {
        return require('../../assets/capability/schema.json');
    }


    static getCapabilities() {

        if( capabilitiesCache ) return capabilitiesCache;

        const capabilities = require('../../assets/capability/capabilities.json');

        capabilitiesCache = capabilities.reduce((obj, capabilityId) => {
            obj[capabilityId] = require(`../../assets/capability/capabilities/${capabilityId}.json`)
            obj[capabilityId] = Capability._composeCapability( capabilityId, obj[capabilityId] );
            return obj;
        }, {});

        return capabilitiesCache;
    }

    static getCapability(id) {

        const capabilities = Capability.getCapabilities();

        const capability = capabilities[id];

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
}

module.exports = Capability;