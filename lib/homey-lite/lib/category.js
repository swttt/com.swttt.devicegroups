'use strict';


let categoryCache = {};
    categoryCache.list = false;
    categoryCache.categories = false;
    categoryCache.capabilities = false;


const path = '../assets/category';
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

                let category = {};
                let capabilities = {capabilities: []};

                // * Note : how this is using a different set of files, this was to all
                // * new added to homey-ib to be more easily merged in to our 'classes'
                try {
                    category = require(`${path}/${type}/${categoryId}.json`);
                } catch (error) {
                    if (error.code !== 'MODULE_NOT_FOUND') {
                        throw error;
                    }
                }


                try {
                    capabilities = require(`${path}/capabilities/${categoryId}.json`);
                } catch (error) {
                    if (error.code !== 'MODULE_NOT_FOUND') {
                        throw error;
                    }
                }

                // Merge the results of the two json files.
                obj[categoryId] = Object.assign(category,capabilities);

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

    /**
     * Returns the capabilities a category has assigned to them.
     *
     * Used to help device-groups show capabilities in filtered  by category.
     *
     * @param id
     * @returns {*}
     */
    static getCapabilities(id) {

        const category = Category.getCategory(id);

        if( ! category.capabilities ) {
            throw new Error('invalid_category_capabilities');
        }

        return category.capabilities;
    }
}

module.exports = Category;