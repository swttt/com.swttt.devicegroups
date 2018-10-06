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

    static mode(values) {
        return 0;
    }
}


module.exports = Helper;
