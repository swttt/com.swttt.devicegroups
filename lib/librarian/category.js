'use strict';


let categoryCache = {};
    categoryCache.list = false;
    categoryCache.categories = false;
    categoryCache.capabilities = false;


const path = './catalog';
const type = 'categories';

/**
 *  Rename Device to category, technically according to the documentation this should be called a 'class',
 *  but its ridiculous to call something a reserved word, even in js.
 *
 *  @todo refactor - currently proof of concept
 */
class Category  {


    static getCategoriesList() {

        if ( ! categoryCache.list ) {
            categoryCache.list = require(`${path}/${type}.json`);
        }

        return categoryCache.list;
    }


    static getCategories() {

        if ( ! categoryCache.categories ) {

            let categories = Category.getCategoriesList();

            categoryCache.categories  = categories.reduce((obj, categoryId) => {

                try {
                  obj[categoryId] = require(`${path}/${type}/${categoryId}.json`);
                } catch (error) {
                    if (error.code !== 'MODULE_NOT_FOUND') {
                        throw error;
                    }
                }
                return obj;
            }, {});

        }

        return categoryCache.categories ;
    }

    static getCategory(id) {

        const categories = Category.getCategories();

        if( ! categories[id] ) {
            throw new Error('invalid_category');
        }

        return categories[id];
    }
}

module.exports = Category;