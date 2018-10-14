'use strict';

const Homey = require('homey');
const {HomeyAPI} = require('./lib/athom-api.js');

class DeviceGroups extends Homey.App {



  onInit() {

    this.log('Device groups is running...');
    this.mehmeh = 'W00t';
    // Force i18n to en or nl, as we are accessing the i18n directly,
    this.i18n = (Homey.ManagerI18n.getLanguage() == 'nl') ? 'nl' : 'en';
  }


  getApi() {
    if (!this.api) {
      this.api = HomeyAPI.forCurrentHomey();
    }
    return this.api;
  }


  async getDevices() {

    const api = await this.getApi();
    return await api.devices.getDevices();
  }


  async getGroups() {

    return Homey.ManagerDrivers.getDriver('devicegroup').getDevices();
  }

  async getGroup(id) {

    let device = await Homey.ManagerDrivers.getDriver('devicegroup').getDevice({id});
    if (device instanceof Error) throw device;
    return device;
  }


  async setDevicesForGroup(id, devices) {

    let group = await this.getGroup(id);

    // Find all devices that should be grouped.
    let allDevices = await this.getDevices();
    let groupedDevices = Object.values(allDevices).filter(d => devices.includes(d.id));

    // Update the group settings.
    let result = await group.setSettings({groupedDevices});
    group.refresh();
    return result;
  }


  async setMethodForCapabilityOfGroup(id, capabilities) {

    let group = await this.getGroup(id);

    group.settings.capabilities = capabilities;

    // Update the group settings.
    let result = await group.setSettings(group.settings);
    group.refresh();
    return result;
  }
}

module.exports = DeviceGroups;
