'use strict';

let methodCache;

const path = '../assets/method';
const type = 'methods'


class Method  {

    static list() {

        if( methodCache) return methodCache;

        methodCache = require(`${path}/${type}.json`);

        return methodCache ;
    }

    static get(id) {

        const methods = Method.list();
        const method = methods[id];

        if( !method ) {
            throw new Error('invalid_method');
        }

        return method;
    }
}

module.exports = Method;