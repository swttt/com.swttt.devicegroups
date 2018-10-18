'use strict';

let capabilitiesCache = {};
    capabilitiesCache.list = false;
    capabilitiesCache.capabilities = {};

const path = './catalog';
const type = 'capabilities';

// @todo refactor - currently proof of concept
class Capability {

  /**
   * Returns a list of all capabilities, from the capabilities.json.
   *
   * @returns {boolean}
   */
  static list() {

    if (!capabilitiesCache.list) {
      capabilitiesCache.list = require(`${path}/${type}.json`);
    }

    return capabilitiesCache.list;
  }


  /**
   * Returns all capabilities, and their details.
   * @returns {*|boolean}
   */
  static all() {

    let capabilities = Capability.list();
    capabilities.forEach(function (id) {
      if (!capabilitiesCache.capabilities[id]) {
        Capability.load(id);
      }
    });

    return capabilitiesCache.capabilities
  }

  /**
   * Loads a specific capability json file.
   *
   * @param id
   */
  static load(id) {

    try {
      capabilitiesCache.capabilities[id] = require(`${path}/${type}/${id}.json`);
    } catch (error) {
      throw new Error('invalid_capability "' + id + '"' + error.message);
    }
  }


  /**
   * Returns a specific Capability's details.
   * @param id
   * @returns {*}
   */
  static get(id) {

    if (!capabilitiesCache.capabilities[id]) {
      Capability.load(id);
    }

    return capabilitiesCache.capabilities[id];
  }
}

module.exports = Capability;