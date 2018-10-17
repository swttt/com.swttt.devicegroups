'use strict';

let methodCache = {};
    methodCache.list = false;
    methodCache.methods = {};


const path = './catalog';
const type = 'methods'

// @todo refactor - currently proof of concept
class Method {


  /**
   * Returns a list of all methods, from the methods.json.
   *
   * @returns {boolean}
   */
  static list() {

    if (!methodCache.list) {
      methodCache.list = require(`${path}/${type}.json`);
    }

    return methodCache.list;
  }


  /**
   * Returns all methods, and their details.
   * @returns {*|boolean}
   */
  static all() {

    let methods = Method.list();

    methods.forEach(function (id) {

      if (!methodCache.methods[id]) {
        Method.load(id);
      }
    });

    return methodCache.methods
  }


  /**
   * Loads a specific method json file.
   *
   * @param id
   */
  static load(id) {

    try {
      methodCache.methods[id] = require(`${path}/${type}/${id}.json`);
    } catch (error) {
      throw new Error('invalid_method "' + id + '"' + error.message);
    }
  }


  /**
   * Returns a specific method's details.
   * @param id
   * @returns {*}
   */
  static get(id) {

    if (!methodCache.methods[id]) {
      Method.load(id);
    }

    return methodCache.methods[id];
  }
}

module.exports = Method;