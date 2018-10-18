'use strict';


let categoryCache = {};
    categoryCache.list = false;
    categoryCache.categories = {};


const path = './catalog';
const type = 'categories';

/**
 *  Rename Device to category, technically according to the documentation this should be called a 'class',
 *  but its ridiculous to call something a reserved word, even in js.
 */
class Category  {


  /**
   * Returns a list of all categories, from the categories.json.
   *
   * @returns {boolean}
   */
  static list() {

    if (!categoryCache.list) {
      categoryCache.list = require(`${path}/${type}.json`);
    }

    return categoryCache.list;
  }


  /**
   * Returns all categories, and their details.
   * @returns {*|boolean}
   */
  static all() {

    let categories = Category.list();
    categories.forEach(function (id) {
      if (!categoryCache.categories[id]) {
        Category.load(id);
      }
    });

    return categoryCache.categories
  }

  /**
   * Loads a specific category json file.
   *
   * @param id
   */
  static load(id) {

    try {
      categoryCache.categories[id] = require(`${path}/${type}/${id}.json`);
    } catch (error) {
      throw new Error('invalid_category "' + id + '"' + error.message);
    }
  }


  /**
   * Returns a specific category's details.
   * @param id
   * @returns {*}
   */
  static get(id) {

    if (!categoryCache.categories[id]) {
      Category.load(id);
    }

    return categoryCache.categories[id];
  }
}

module.exports = Category;