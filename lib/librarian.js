'use strict';

const Capabilities = require('./librarian/capability');
const Categories = require('./librarian/category');
const Methods = require('./librarian/method');

/**
 * Largely a placeholder/interface, for when catalog classes a refactored and are no longer static methods.
 */
class Librarian {

    get capability () {
        return Capabilities;
    }

    get category () {
        return Categories;
    }

    get method () {
        return Methods;
    }

    getCapabilities() {
        return Capabilities.all();
    }

    getCapability(id) {
        return Capabilities.get(id);
    }

    getCategories() {
        return Categories.all();
    }

    getCategory(id) {
        return Categories.get(id);
    }

    getMethods() {
        return Methods.all();
    }

    getMethod(id) {
        return Methods.get(id);
    }


    async getJSON(){
        return {
            capabilities :  await this.getCapabilities(),
            methods :       await this.getMethods(),
            categories :    await this.getCategories(),
        }
    }

    debug ()
    {
        console.log('debug');
    }

}

module.exports = Librarian;