'use strict';

let categoryCache;

const path = '../assets/category';
const type = 'categories';

/**
 *  Rename Device to category, technically according to the documentation this should be called a 'class',
 *  but its ridiculous to call something a reserved word, even in js.
 *
 *  @todo refactor - currently proof of concept
 */
class Category  {

    static list() {

        if( categoryCache) return categoryCache;

        const categories = require(`${path}/${type}.json`);

        categoryCache  = categories.reduce((obj, categoryId) => {

            let category = {};
            let capabilities = {capabilities: []};

            try {
                category = require(`${path}/${type}/${categoryId}.json`);
            } catch (error) {
                if (error.code !== 'MODULE_NOT_FOUND') {
                    throw error;
                }
            }

            // * Note : how this is using a different set of files, this was to all
            // * new added to homey-ib to be more easily merged in to our 'classes'
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

        return categoryCache ;
    }

    static get(id) {

        const categories = Category.list();
        const category = categories[id];

        if( !category ) {
            throw new Error('invalid_category');
        }

        return category;
    }

    /**
     * Returns the capabilities a category has assigned to them.
     *
     * Used to help device-groups show capabilities in filtered  by category.
     *
     * @param id
     * @returns {*}
     */
    static capabilities(id) {

        const category = Category.get(id);

        if( ! category.capabilities ) {
            throw new Error('invalid_category');
        }

        return category.capabilities;

    }
}

module.exports = Category;