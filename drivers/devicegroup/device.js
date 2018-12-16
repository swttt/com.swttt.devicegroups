'use strict';

const Homey = require('homey');
const HomeyAPI = require('athom-api').HomeyAPI;

class DeviceGroupDevice extends Homey.Device {
  async onInit() {
    this.log('device init');
    this.api = await this.getApi();

    this.registerMultipleCapabilityListener(this.getCapabilities(), async(valueObj, optsObj) => {
      try {
        const groupedDevices = await this.getSetting('groupedDevices');

        for (let groupedDevice of groupedDevices) {
          groupedDevice = await this.api.devices.getDevice({id: groupedDevice.id});

          Object.entries(valueObj).forEach(([key, value]) => {
              groupedDevice.setCapabilityValue(key, value);
          });
        }

        return Promise.resolve();
      }
      catch (err) {
        this.error(err);
        return Promise.reject();
      }
    }, 500);
  }

  // this method is called when the Device is added
  onAdded() {
    this.log('device added');
  }

  // this method is called when the Device is deleted
  onDeleted() {
    this.log('device deleted');
  }

  getApi() {
    if (!this.api) {
      this.api = HomeyAPI.forCurrentHomey();
    }
    return this.api;
  }
}

module.exports = DeviceGroupDevice;
