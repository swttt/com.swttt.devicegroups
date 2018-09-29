'use strict';


let cache;

class Lite {

    debug(...args) {
        if( !this._debug ) return;
        console.log('[dbg]', ...args);
    }

    static list() {

    }

    static get(id) {

    }
}

module.exports = Lite;