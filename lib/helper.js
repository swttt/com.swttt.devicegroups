'use strict';

/**
 * Just a simple helper class for my items.
 */
class Helper {

  /**
   * Ensure that the value is a boolean.
   * @param value
   * @returns {boolean}
   */
  static boolean(value) {
    return !!value;
  }

  /**
   * Force the value to be a number
   * @param value
   * @returns {number}
   */
  static number(value) {
    return value * 1;
  }

  /**
   * Enum types are not currently supported
   * @param value
   */
  static enum(value) {
    return 0;
  }

  /**
   * Sum of the values of the device
   * @param values
   * @returns {*}
   */
  static sum(values) {
    return values.reduce(function (a, b) {
      return a + b
    }, 0);
  }

  /**
   * The largest value of the devices
   * @param values
   * @returns {number}
   */
  static max(values) {
    return Math.max(...values);
  }

  /**
   * The smallest number of the devices
   * @param values
   * @returns {number}
   */
  static min(values) {
    return Math.min(...values);
  }

  /**
   * Basically a NAND
   * need to work out if we will require this for types other than boolean.
   */
  static nand(values) {
    return this.sum(values) !== values.length
  }

  /**
   * The mean average (total/number)
   * @param values
   * @returns {number}
   */
  static mean(values) {
    return this.sum(values) / values.length
  }

  /**
   * The value in the middle, or ave of two middle items if array is even
   *
   * @param values
   * @returns {number}
   */
  static median(values) {

    values.sort((a, b) => a - b);

    let lowMiddle = Math.floor((values.length - 1) / 2);
    let highMiddle = Math.ceil((values.length - 1) / 2);

    // Even length will be ave of two middle ones, even will be middle item.
    return (values[lowMiddle] + values[highMiddle]) / 2;
  }

  static ignore(values) {
  }

  static always(values) {
    return 1;
  }

  static never(values) {
    return 0;
  }

  /**
   * @author https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript
   *
   * Hacked the result to always be the first item and added bracket around for statement. We are not animals.
   *
   * @param values
   * @returns {Array}
   */
  static mode(values) {


    return 0;
    // as result can be bimodal or multi-modal,
    // the returned result is provided as an array
    // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]

    var modes = [], count = [], i, number, maxIndex = 0;

    for (i = 0; i < values.length; i += 1) {
      number = values[i];
      count[number] = (count[number] || 0) + 1;
      if (count[number] > maxIndex) {
        maxIndex = count[number];
      }
    }

    for (i in count) {
      if (count.hasOwnProperty(i)) {
        if (count[i] === maxIndex) {
          modes.push(Number(i));
        }
      }
    }

    return modes[0];
  }

}


module.exports = Helper;
