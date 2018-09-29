'use strict';

const Homey = require('homey');
const {
  HomeyAPI
} = require('../../lib/athom-api.js');


const map = require('../../lib/map.js');


class DeviceGroupDevice extends Homey.Device {


    /**
     * Automatically runs
     * Gathers the required properties, sets our listeners, and polls
     */
    onInit() {

        this.settings = this.getSettings();

        this.initApi().then( () => {

            this.initListener();
            this.initPolls();

        }).catch( (error) => {
            this.error(error);
        });

    }


    /**
     * Initialises the capability listener.
     *
     * Basically : Registers every capability this device (MultipleCapabilityListener) has, so
     * when any of the devices capabilities are changed, the function is called  which sets the
     * value of all of the 'grouped/real' devices to said value.
     *
     * @returns {Promise<void>}
     */
    async initListener() {

        try {
            // Register all of the capabilities at once with a (async) call back.
            this.registerMultipleCapabilityListener(this.getCapabilities(), async(valueObj, optsObj) => {
                return this.updateCapability(valueObj, optsObj);
            }, 500);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }


    /**
     * Update the value of all the grouped items
     *
     * Note that it's using the WebAPI to set the values.
     * @param valueObj
     * @param optsObj
     * @returns {Promise<*>}
     */
    async updateCapability(valueObj, optsObj) {
        try {
            // Alias
            let deviceGroup = this.settings.groupedDevices;

            // Loop through each 'real' device in the group
            for (let key in deviceGroup) {

                // Get the WebAPI reference 'real' device
                let device = await this.api.devices.getDevice({
                    id: deviceGroup[key].id
                });

                // Using the WebAPI for the 'real' device, set the capability value, to what ever we just changed.
                for (let capabilityId in valueObj) {

                    // Only bother setting if the capability is setable.
                    if (map.group[capabilityId].capability.setable) {
                        device.setCapabilityValue(capabilityId, valueObj[capabilityId]);
                    }
                }
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Initialise the polling, this is how we gather our grouped devices data
     * to ensure that the card/mobile is kept up to date. Will run the first poll.
     *
     * @returns {Promise<void>}
     */
    async initPolls() {

        try {
            // Run our initial poll immediately.
            this.pollDevices().then(() => {

                // Set the polling interval based from the settings, once we have the first value.
                this.interval = setInterval(() => { this.pollDevices(); }, 1000 * 60 * 0.05); // In minutes
                // @todo : change the above debugging to the below production code.
                // setInterval(() => { this.pollDevices(); }, 1000 * 60 * this.settings.pollingFrequency); // In minutes
            });

            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    // min, max, ave, sum, mean, median
    // @todo refactor
    async pollDevices () {

        let values = [], value;
        let capabilities = this.getCapabilities();

        // Initialise the values
        for (let i in capabilities) {
            values[capabilities[i]] = [];
        }

        // Loop through each of the devices in the group
        for (let x in this.settings.groupedDevices) {

            // requires the API.
            let device = await this.api.devices.getDevice({
                id: this.settings.groupedDevices[x].id
            });

            // A refresh is required for the WebAPI when accessing capabilities.
            await device.refreshCapabilities();

            // Loop through each of the capabilities checking each of the devices value.
            for (let i in capabilities) {
                values[capabilities[i]].push(device.state[capabilities[i]]);
            }
        }

        // loop through each of the capabilities calculating the values.
        for (let i in capabilities) {
            try {
                // Alias
                let capability = capabilities[i];
                // let method = this.settings.capabilities[capability].function;

                // @todo : hard to set the value to last item.
                let value = (values[capability][values[capability].length-1]);

                // Calculate our value
                // value = this[method.function](values[capability]);
                // Convert the value in the to capabilities required type
                // value = this[map.group[capability].type](value);

                // // Set the capability of the groupedDevice
                this.setCapabilityValue(capability, value).then().catch( (error) => {
                    console.log(error.message);
                });
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
    }


    /**
     * Initialise the API, but getting the API for (current) Homey
     * and subscribing to the observer.
     *
     * @returns {Promise<void>}
     */
    async initApi () {
        try {
            this.api = await this.getApi();
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }


    /**
     * Retrieves the HomeAPI library for the (current) Homey
     * @returns {*}
     */
    getApi() {
        if (!this.api) {
            this.api = HomeyAPI.forCurrentHomey();
        }
        return this.api;
    }

    /**
     * Removing device interval polling
     */
    onDeleted() {
        clearInterval(this.interval);
    }

    /**
     * Ensure that the value is a boolean.
     * @param value
     * @returns {boolean}
     */
    boolean(value) {
        return !!value;
    }

    /**
     * Force the value to be a number
     * @param value
     * @returns {number}
     */
    number(value) {
        return value * 1;
    }

    /**
     * Enum types are not currently supported
     * @param value
     */
    enum(value) {
        throw new error('enum: This has not yet been implemented');
    }

    /**
     * Sum of the values of the device
     * @param values
     * @returns {*}
     */
    sum (values){
        return values.reduce(function(a,b){
            return a + b
        }, 0);
    }

    /**
     * The largest value of the devices
     * @param values
     * @returns {number}
     */
    max (values) {
        return Math.max(...values);
    }

    /**
     * The smallest number of the devices
     * @param values
     * @returns {number}
     */
    min (values) {
        return Math.min(...values);
    }

    /**
     * The mean average (total/number)
     * @param values
     * @returns {number}
     */
    mean (values) {
        return this.sum(values) / values.length
    }

    median(values) {
        throw new error('median: This has not yet been implemented');
    }

    mode(values) {
        throw new error('mode: This has not yet been implemented');
    }
}

module.exports = DeviceGroupDevice;
