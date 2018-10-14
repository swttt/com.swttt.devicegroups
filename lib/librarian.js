'use strict';

const Capabilities = require('./librarian/capability');
const Categories = require('./librarian/category');
const Methods = require('./librarian/method');

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