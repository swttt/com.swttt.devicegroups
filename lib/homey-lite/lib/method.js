'use strict';

let methodCache = {};
    methodCache.list = false;
    methodCache.methods = false;


const path = '../assets/method';
const type = 'methods'

// @todo refactor - currently proof of concept
class Method  {


    static getMethodsList() {

        if ( ! methodCache.list ) {
            methodCache.list = require(`${path}/${type}.json`);
        }

        return methodCache.list;

    }

    static getMethods() {


        if ( ! methodCache.methods ) {

            let methods = Method.getMethodsList();

            methodCache.methods = methods.reduce((obj, methodId) => {

                obj[methodId] = require(`${path}/${type}/${methodId}.json`);

                return obj;
            }, {});
        }

        return methodCache.methods;
    }


    static getMethod(id) {

        const methods = Method.getMethods();

        if( ! methods[id] ) {
            throw new Error('invalid_method');
        }

        return methods[id];
    }
}

module.exports = Method;