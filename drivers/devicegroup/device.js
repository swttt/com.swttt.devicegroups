'use strict';

const Homey = require('homey');
const {
  HomeyAPI
} = require('../../lib/athom-api.js');

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
                    device.setCapabilityValue(capabilityId, valueObj[capabilityId]);
                }
            }
            return Promise.resolve();
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    // Placeholder
    async initPolls() {}


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

    // Placeholder Ill need this to remove the polls
    onDeleted() {
        this.log('device deleted');
    }
}

module.exports = DeviceGroupDevice;
