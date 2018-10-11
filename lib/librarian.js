'use strict';

const Capabilities = require('./catalog/capability');
const Categories = require('./catalog/category');
const Methods = require('./catalog/method');

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
        return Capabilities.getCapabilities();
    }

    getCapability(id) {
        return Capabilities.getCapability(id);
    }

    getCategories() {
        return Categories.getCategories();
    }

    getCategory(id) {
        return Categories.getCategory(id);
    }

    getMethods() {
        return Methods.getMethods();
    }

    getMethod(id) {
        return Methods.getMethod(id);
    }


    async getJSON(){
        return {
            capabilities :  await this.getCapabilities(),
            methods :       await this.getMethods(),
            categories :    await this.getCategories(),
        }
    }

}

module.exports = Librarian;