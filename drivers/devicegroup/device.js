'use strict';

const Homey = require('homey');
const HomeyLite = require('../../lib/homey-lite/lib');

const {
  HomeyAPI
} = require('../../lib/athom-api.js');


/**
 * @todo move helper classes out of device.
 */
class DeviceGroupDevice extends Homey.Device {


    /**
     * Automatically runs
     * Gathers the required properties, sets our listeners, and polls
     */
    onInit() {
        console.log('Initialising ' + this.getName());

        this.settings = this.getSettings();
        this.store = this.getStore();
        this.library = new HomeyLite();



        // Backwards compatibility check
        this.checkForUpdates().then( () => {

            this.initApi().then( () => {

                this.initListener();
                this.initPolls();

            }).catch( (error) => {
                throw error;
            });

        }).catch( (error) => {
            this.error(error);
        });

    }


    /**
     * Refresh the settings & capability listeners
     * @returns {Promise<void>}
     */
    async refresh() {

        this.setUnavailable().then( (result) => {

            // destroy the polling
            clearInterval(this.interval);

            // update the settings
            this.settings = this.getSettings();

            // re-initialise the polling
            this.initPolls();

            this.setAvailable();
        })
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
                    if (this.library.getCapability(capabilityId).setable) {
                        device.setCapabilityValue(capabilityId, valueObj[capabilityId]).catch( (error) => {
                            console.log('Error setting capability ' + capabilityId + ' on ' + this.getName());
                        });
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
                this.interval = setInterval(() => { this.pollDevices(); }, 1000 * this.settings.pollingFrequency); // In seconds

            }).catch( (error) => {
                return Promise.reject(error);
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
        //
        // // loop through each of the capabilities calculating the values.
        for (let i in capabilities) {
        //
        //     // Only bother getting the capability value .. if it is getable.
            if (this.library.getCapability(capabilities[i]).getable) {

                try {
                    // Aliases
                    let key = capabilities[i];                              // Alias the capability key
                    let value = values[key];                                // Alias the value
                    let method = this.settings.capabilities[key].method;    // Alias the method we are going to use
                    let type = this.library.getCapability(key).type;        // Alias the data type

                    // if the method is set the false - its disabled.
                    if (method !== false) {

                        // Calculate our value using our function
                        value = this[this.library.getMethod(method).function](value);

                        // Convert the value in the to capabilities required type
                        value = this[type](value);

                        // // Set the capability of the groupedDevice
                        this.setCapabilityValue(key, value).then().catch( (error) => {
                            console.log(error.message);
                        });
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
            }
        }
    }


    /**
     * Check for application updates, and then update if required
     *
     * @returns {Promise<*>} true if update installed, false if no update
     */
    async checkForUpdates() {

        try {

            // If we do not have a version property at all
            // This device was added prior to 1.2.0 when the version was instated.
            // Upgrade the item with all 1.2.0 features disabled.
            if (!this.store.hasOwnProperty('version')) {

                console.log('Upgrading ' + this.getName());

                let capabilities = await this.getCapabilities();
                let settings = {capabilities: {}};

                for (let i in capabilities) {
                    // Add all the settings which are new to 1.2.0
                    // Default each of method to false (ie disabled).
                    settings.capabilities[capabilities[i]] = {};
                    settings.capabilities[capabilities[i]].method = false;
                }

                // Gigo check :: that there are capabilities
                if (Object.keys(settings.capabilities).length) {
                    this.setSettings(settings);
                    this.setStoreValue('version', '1.2.0');
                    this.store.version = '1.2.0';

                    console.log('Completed ' + this.getName() + ' ' + this.store.version + ' upgrade');
                    return true;
                }
            }
        }
        catch (error) {
            return Promise.reject(error);
        }

        return false;
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
        return 0;
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
     * Basically a NAND
     * need to work out if we will require this for types other than boolean.
     */
    none (values) {
        return this.sum(values) !== values.length
    }

    /**
     * The mean average (total/number)
     * @param values
     * @returns {number}
     */
    mean (values) {
        return this.sum(values) / values.length
    }

    /**
     * The value in the middle, or ave of two middle items if array is even
     *
     * @param values
     * @returns {number}
     */
    median(values) {

        values.sort((a, b) => a - b);

        let lowMiddle = Math.floor((values.length - 1) / 2);
        let highMiddle = Math.ceil((values.length - 1) / 2);

        // Even length will be ave of two middle ones, even will be middle item.
        return (values[lowMiddle] + values[highMiddle]) / 2;
    }

    mode(values) {
        return 0;
    }
}

module.exports = DeviceGroupDevice;
