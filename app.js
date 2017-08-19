'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('./lib/athom-api.js');

var allDevices = {};

class DeviceGroups extends Homey.App {

  getApi() {
    if (!this.api) {
      this.api = HomeyAPI.forCurrentHomey();
    }
    return this.api;
  }
  async getDevices() {
    const api = await this.getApi();
    allDevices = await api.devices.getDevices();
    return allDevices;
  }

  onInit() {

    this.log('Device groups is running...');

  }

}

module.exports = DeviceGroups;
