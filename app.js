'use strict';

const Homey = require('homey');
const {HomeyAPI} = require('./lib/athom-api.js');
const Librarian   = require('./lib/librarian');

class DeviceGroups extends Homey.App {



  onInit() {

    // require('inspector').open(9229, '0.0.0.0');

    this.log('Device groups is running...');

    // Set our library reference
    this.library = new Librarian();

    // Force i18n to en or nl, as we are accessing the i18n directly,
    this.i18n = (Homey.ManagerI18n.getLanguage() == 'nl') ? 'nl' : 'en';

    // Prime the API into memory
    this.getApi();
  }


  getApi() {
    if (!this.api) {
      this.api = HomeyAPI.forCurrentHomey();
    }
    return this.api;
  }


  async getDevices() {

    return await (await this.getApi()).devices.getDevices();
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

    // Looks like vue (upon settings) is sending a padded array with undefined items
    // Checks that the devices sent exist in allDevices, filters out any that dont.
    let grouped = Object.values(allDevices).filter(d => devices.includes(d.id));

    let ids = [];
    for (let i in grouped) {
      ids.push(grouped[i].id);
    }

    group.settings.groupedDevices = ids;

    // Update the group settings.
    let result = await group.setSettings(group.settings);
    await group.refresh();

    return result;
  }


  async setMethodForCapabilityOfGroup(id, capabilities) {

    let group = await this.getGroup(id);

    group.settings.capabilities = capabilities;

    // Update the group settings.
    let result = await group.setSettings(group.settings);
    await group.refresh();
    return result;
  }
}

module.exports = DeviceGroups;
