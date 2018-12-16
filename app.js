'use strict';

const Homey = require('homey');
const HomeyAPI = require('athom-api').HomeyAPI;

class DeviceGroups extends Homey.App {

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
    let device = await Homey.ManagerDrivers.getDriver('devicegroup').getDevice({ id });
    if (device instanceof Error) throw device;
    return device;
  }

  async setDevicesForGroup(id, devices) {
    let group = await this.getGroup(id);

    // Find all devices that should be grouped.
    let allDevices     = await this.getDevices();
    let groupedDevices = Object.values(allDevices).filter(d => devices.includes(d.id));

    // Update the group settings.
    return await group.setSettings({ groupedDevices });
  }

  onInit() {
    this.log('Device groups is running...');
  }

}

module.exports = DeviceGroups;
