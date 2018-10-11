'use strict';

const Homey       = require('homey');
const HomeyLite   = require('../../lib/homey-lite/lib');
const {HomeyAPI}  = require('../../lib/athom-api.js');
const Helper      = require('../../lib/helper');


/**
 * @todo consistent naming of grouped vs devices
 * In scope of this application the 'device' is the virtual item.
 * Where as the grouped are the devices that we are working with.
 * However it looks like the original intention was for this device
 * to be called 'GroupDevice'. Whether or not it semantically correct
 * more critical at the moment is its inconsistent use. eg.
 * deviceGroup = this.settings.groupedDevices :: but class = DeviceGroup
 */
class DeviceGroupDevice extends Homey.Device {


  /**
   * Automatically runs
   * Gathers the required properties, sets our listeners, and polls
   */
  async onInit() {
    this.log('Initialising ' + this.getName());

    // Set our properties
    this.settings = this.getSettings();
    this.store = this.getStore();
    this.library = new HomeyLite();
    this.capabilities = this.getCapabilities();

    try {
      await this.checkForUpdates();
      await this.initApi();
      this.initListener();            // don't wait
      this.initPolls();               // don't wait
    } catch (error) {
      this.error(error);
    }
  }


  /**
   * Refresh the settings & capability listeners
   * @returns {Promise<void>}
   */
  async refresh() {

    this.log('Refreshing Device Group ' + this.getName());

    try {
      await this.setUnavailable();        // Set card to unavailable
      this.destroyPoll()                  // destroy the polling
      this.updateLabels();                // update the labels  (settings which store current device/capability/methods)
      this.initPolls();                   // re-initialise the polling
      this.settings = this.getSettings(); // update the settings
      this.setAvailable();                // set the card back to being available
    } catch (error) {
      // @todo
      throw new error;
    }
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

    // Register all of the capabilities at once with a (async) call back.
    return this.registerMultipleCapabilityListener(this.getCapabilities(), async (valueObj, optsObj) => {
      return this.updateCapability(valueObj, optsObj);
    }, 500);
  }


  /**
   * Update the value of all the grouped items
   *
   * Note that it's using the WebAPI to set the values.
   *
   * @param valueObj
   * @param optsObj
   * @returns {Promise<*>}
   */
  async updateCapability(valueObj, optsObj) {

    // Alias
    let deviceGroup = this.settings.groupedDevices;

    // Loop through each 'real' device in the group
    for (let key in deviceGroup) {

      // Get the WebAPI reference 'real' device
      let device = await this.api.devices.getDevice({
        id : deviceGroup[key].id
      });

      // Using the WebAPI for the 'real' device, set the capability value, to what ever we just changed.
      for (let capabilityId in valueObj) {

        // Only bother setting if the capability is setable.
        if (this.library.getCapability(capabilityId).setable) {
          device.setCapabilityValue(capabilityId, valueObj[capabilityId]).catch((error) => {
            console.log('Error setting capability ' + capabilityId + ' on ' + this.getName());
          });
        }
      }
    }

    return true;
  }


  /**
   * Initialise the polling,
   *
   * Will then assign the pollDevice to be ran on pollingFrequency. this is how we gather our grouped devices data
   * to ensure that the card/mobile is kept up to date. Will run the first poll ensuring the device is up to date from the start.
   *
   * @todo Initally I attempted to add a deviceCapability listener to the individual devices, but was unsuccessful, try again.
   * @returns {Promise<boolean>}
   */
  async initPolls() {

    // Run our initial poll immediately.
    await this.pollDevices();

    // Set the polling interval based from the settings, once we have the first value.
    this.interval = setInterval(async () => {
      this.pollDevices();
    }, 1000 * this.settings.pollingFrequency); // In seconds

    return true;
  }


  /**
   * Simple function to do a poll
   *
   * Gets the devices values, and then sets the grouped card values.
   * @returns {Promise<void>}
   */
  async pollDevices() {

    this.setCardValues(await this.getDevicesValues());

  }


  /**
   * Get all of the grouped capability values for all of the devices
   *
   * @returns {Promise<void>}
   */
  async getDevicesValues() {

    let values = [], value;

    // Initialise the values
    for (let i in this.capabilities) {
      values[this.capabilities[i]] = [];
    }

    // Loop through each of the devices in the group
    for (let x in this.settings.groupedDevices) {

      // requires the API. @todo investigate whether this should be stored in memory
      let device = await this.api.devices.getDevice({
        id : this.settings.groupedDevices[x].id
      });

      // A refresh is required for the WebAPI when accessing capabilities.
      await device.refreshCapabilities();

      // Loop through each of the capabilities checking each of the devices value.
      for (let i in this.capabilities) {
        values[this.capabilities[i]].push(device.state[this.capabilities[i]]);
      }
    }

    return values;
  }


  /**
   * Assigns a card's values to the values of the supplied devices
   *
   * Based off of the capabilities and their values supplied and which methods they have assigned to them
   * setCardValues will determine what value each of the capabilities of this device should be then assigns it
   *
   * @param values
   * @returns {Promise<void>}
   */
  async setCardValues(values) {

    // loop through each of the capabilities calculating the values.
    for (let i in this.capabilities) {

      // Only bother getting the capability value .. if it is getable.
      if (this.library.getCapability(this.capabilities[i]).getable) {

        // Aliases
        let key = this.capabilities[i];                         // Alias the capability key
        let value = values[key];                                // Alias the value
        let method = this.settings.capabilities[key].method;    // Alias the method we are going to use
        let type = this.library.getCapability(key).type;        // Alias the data type

        // if the method is set the false - its disabled
        // if the method is set to ignore, don't update use the card behaviour.
        if (method !== false && method !== 'ignore') {

          // Calculate our value using our function
          value = Helper[this.library.getMethod(method).function](value);

          // Convert the value in the to capabilities required type
          value = Helper[type](value);

          // // Set the capability of the groupedDevice
          this.setCapabilityValue(key, value).then().catch((error) => {
            console.log('err:');        // DEBUG
            console.log(error.message); // DEBUG
          });
        }
      }
    }
  }


  /**
   * Will check the current devices and capability methods, and update
   * the label settings.
   * @returns {Promise<void>}
   */
  async updateLabels() {

    return false; // disabled
    let labelDevices = [];

    for (let x in this.settings.groupedDevices) {

      labelDevices.push(this.settings.groupedDevices[x].name);
    }

    this.setSettings({labelDevices : labelDevices});
  }


  /**
   * Check for application updates, and then update if required
   * @todo get beta ready
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
        let settings = {capabilities : {}};

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
      //@todo exception handing
      throw new error;
    }
    return false;
  }


  /**
   * Initialise the API, but getting the API for (current) Homey
   * and subscribing to the observer.
   * @returns {Promise<*>}
   */
  async initApi() {
    this.api = await this.getApi();
    return true;
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
   * Remove the poll when device deleted
   */
  onDeleted() {
    this.destroyPoll();
  }

  
  /**
   * Removing device interval polling
   */
  destroyPoll() {
    clearInterval(this.interval);
  }
}

module.exports = DeviceGroupDevice;

