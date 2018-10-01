'use strict';

const Capabilities = require('./lib/capability');
const Categories = require('./lib/category');
const Methods = require('./lib/method');

class Lib {

    get capabilities () {
        return Capabilities.list();
    }

    get capability () {
        return Capabilities;
    }

    get categories () {
        return Categories.list();
    }

    get category () {
        return Categories;
    }

    get methods () {
        return Methods.list();
    }

    get method () {
        return Methods;
    }

}

module.exports = Lib;