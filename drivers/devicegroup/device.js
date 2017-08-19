'use strict';

const Homey = require('homey');
const {
  HomeyAPI
} = require('../../lib/athom-api.js');

class DeviceGroupDevice extends Homey.Device {
  onInit() {
    this.log('device init');

    this.registerMultipleCapabilityListener(this.getCapabilities(), async(valueObj, optsObj) => {
      try {
        var api = await this.getApi();
        await api.devices.subscribe();
        var deviceGroup = await this.getSettings().groupedDevices;
        for (var key in deviceGroup) {
          let device = await api.devices.getDevice({
            id: deviceGroup[key].id
          });
          for (var key in valueObj) {
            device.setCapabilityValue(key, valueObj[key]);
          }

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
