'use strict';

const Homey       = require('homey');
const Helper      = require('../../lib/helper');


/**
 * Notes about naming convention, this is a DeviceGroup ie. a Device which contains a group.
 * A groupedDevice is one of the items which this 'DeviceGroup' contains or if you prefer a device which has been grouped.
 */
class DeviceGroupDevice extends Homey.Device {

  /**
   * Automatically runs
   * Gathers the required properties, sets our listeners, and polls
   */
  async onInit() {
    this.log('Initialising ' + this.getName());

    // Set our properties
    this.settings = await this.getSettings();
    this.capabilities = this.getCapabilities();
    this.interval = false;
    this.devices = {};

    try {
      await this.checkForUpdates();
      this.initListener();            // don't wait
      this.initPolls();               // don't wait
    } catch (error) {
      this.error(error);
    }
  }

  /**
   * When a device is added, set our label values.
   *
   *
   * @returns {Promise<void>}
   */
  async onAdded() {
    this.log('Adding Device Group ' + this.getName());
    //this.updateDevicesLabels();
    //this.updateCapabilityLabels();
  }


  /**
   * Refresh the settings & capability listeners
   *
   * Sets device unavailable/available while updating, regathers the latest, settings emptys all devices for them to rebuilt, and updates the deviceGroup labels.
   *
   * @todo Previously there was a race condition (generally caused from settings page) which would cause havock, now Intervals have been removed, this requires re-testing.
   * @returns {Promise<boolean>}
   */
  async refresh() {
    this.log('Refreshing Device Group ' + this.getName());

    try {
      await this.setUnavailable();              // Set card to unavailable
      this.settings = await this.getSettings(); // update the settings, ensure this happens prior to updating polls/labels
      this.devices = {};                        // Empty our device cache
      this.updateDevicesLabels();               // update the device label (settings which store current devices)
      this.updateCapabilityLabels();            // update the capability labels (settings which store current capability/methods)
      await this.setAvailable();                // set the card back to being available
    } catch (error) {
      this.console.log(error);
      this.error(error);
    }

    return true;
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
    this.log('Initialising Listener Device Group ' + this.getName());
    // Register all of the capabilities at once with a (async) call back.
    return this.registerMultipleCapabilityListener(this.capabilities, async (valueObj, optsObj) => {
      return this.updateCapability(valueObj, optsObj);
  }, 500);
  }


  /**
   * Update the value of all the grouped items
   *
   * Note that it's using the API to set the values.
   *
   * @param valueObj
   * @param optsObj
   * @returns {Promise<*>}
   */
  async updateCapability(valueObj, optsObj) {
    this.log('Update Capability Device Group ' + this.getName());
    // Loop through each 'real' device in the group
    for (let key in this.settings.groupedDevices) {

      // Get the WebAPI reference 'real' device ::
      let device = await this.getDevice(this.settings.groupedDevices[key]);

      // Using the API for the 'real' device, set the capability value, to what ever we just changed.
      for (let capabilityId in valueObj) {
        device.setCapabilityValue(capabilityId, valueObj[capabilityId]).catch((error) => {
          this.log('Error setting capability ' + capabilityId + ' on ' + this.getName() + ' err' + error.message);
        });
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
   * Initially I attempted to add a deviceCapability listener to the individual devices, but was unsuccessful.
   *
   * @returns {Promise<boolean>}
   */
  async initPolls() {
    this.log('Initialising Polls Device Group ' + this.getName());
    this.pollDevices();
  }


  /**
   * Simple function to do a poll
   *
   * Pauses X seconds then calls self.
   *
   * @todo investigate Homey.ManagerCron
   *
   * Gets the devices values, and then sets the grouped card values.
   * @returns {Promise<void>}
   */
  async pollDevices() {
    await this.setCardValues(
        await this.getDevicesValues()
    );

    setTimeout(this.pollDevices.bind(this), 1);//000 * this.settings.pollingFrequency);
  }


  /**
   * Get all of the grouped capability values for all of the devices
   *
   * @returns {Promise<void>}
   */
  async getDevicesValues() {

    let values = [];

    // Initialise the values
    for (let i in this.capabilities) {
      values[this.capabilities[i]] = [];
    }

    // Loop through each of the devices in the group
    for (let x in this.settings.groupedDevices) {

      // There is a bug where this is called while group devices is empty ..
      // Seems to be prevalent when updating the settings using the API, possibly race condition
      if (this.settings.groupedDevices.hasOwnProperty(x)) {

        // requires the AP, stored in memory - see getDevice() for details.
        let device = await this.getDevice(this.settings.groupedDevices[x])

        // A refresh is required for the API when accessing capabilities.
        // await device.refreshCapabilities();

        // Loop through each of the capabilities checking each of the devices value.
        for (let i in this.capabilities) {
          values[this.capabilities[i]].push(device.state[this.capabilities[i]]);
        }

        device = null;
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
   * @returns {Promise<boolean>}
   */
  async setCardValues(values) {

    // DEBUG force block scope variable, sanity check for memory debugging. @todo to be removed.
    let a = {key: null, value: null, method : null, type: null}

    // loop through each of the capabilities calculating the values.
    for (let i in this.capabilities) {

      // Aliases
      a.key = this.capabilities[i];                           // Alias the capability key
      a.value = values[a.key];                                // Alias the value
      a.method = this.settings.capabilities[a.key].method;    // Alias the method we are going to use
      a.type = Homey.app.library.getCapability(a.key).type;   // Alias the data type

      // if the method is false - its disabled if it's set to ignore, don't update use the card behaviour.
      if (a.method !== false && a.method !== 'ignore') {

        // Calculate our value using our function
        a.value = Helper[Homey.app.library.getMethod(a.method).function](a.value);

        // Convert the value in the to capabilities required type
        a.value = Helper[a.type](a.value);

        try {
          // Set the capability of the groupedDevice
          await this.setCapabilityValue(a.key, a.value);
        } catch (error) {
          this.log('Error on setting capability value : ' + a.key + ' ' + value + ' err:' +  error.message); // DEBUG

          throw new error;
        }

      }
    }

    // DEBUG Sanity check for GC, while memory testing @todo to be removed.
    a = null;
    return true;
  }


  /**
   * Will update the devices label setting to the current devices.
   *
   * @returns {Promise<void>}
   */
  async updateDevicesLabels() {
    this.log('Update Device Labels Device Group ' + this.getName());
    let labels = [];

    for (let key in this.settings.groupedDevices) {

      let device = await this.getDevice(this.settings.groupedDevices[key]);

      labels.push(device.name);
    }

    this.setSettings({labelDevices : labels.join(', ')});
  }

  /**
   * Will update the capabilities label setting
   *
   * @returns {Promise<void>}
   */
  async updateCapabilityLabels() {
    this.log('Update Capability Labels Device Group ' + this.getName());
    let labels = [];
    for (let i in this.capabilities) {

      // Alias
      let capability = Homey.app.library.getCapability(this.capabilities[i]);
      let method = this.settings.capabilities[this.capabilities[i]].method

      labels.push(capability.title[Homey.App.i18n]);

      // If we have a method assigned, attach it to our description.
      if (method) {
        labels[labels.length -1] += ' (' + Homey.app.library.getMethod(method).title[Homey.App.i18n] + ')';
      }
    }

    this.setSettings({labelCapabilities : labels.join(', ')});
  }


  /**
   * Check for application updates, and then update if required
   * @todo get beta ready
   * @returns {Promise<*>} true if update installed, false if no update
   */
  async checkForUpdates() {
    return false;
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
      throw new error;
    }
    return false;
  }

  /**
   * Gets an API device from the APP, cache it
   *
   * Was added as storing the entire device with in a variable, in order to reduce the calls to the API
   * which appears to have a memory leak where "something" with in there is not getting GC().
   *
   * @todo - store the value with in the app rather than the driver - this which will reduce memory usage for groups which share devices.
   *
   * @param id
   * @returns {Promise<*>}
   */
  async getDevice(id) {

    if (!this.devices[id]) {
      // Get the WebAPI reference 'real' device
      this.devices[id] = await (await Homey.app.api).devices.getDevice({
        id : id
      });
    }
    return this.devices[id];
  }


  /**
   * Remove the poll when device deleted
   */
  onDeleted() {
    this.log('Deleting  Device Group ' + this.getName());
  }

}

module.exports = DeviceGroupDevice;

