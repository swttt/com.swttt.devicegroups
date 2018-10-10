'use strict';

const Homey = require('homey');
const Library = require('./lib/homey-lite/lib');
const {HomeyAPI} = require('./lib/athom-api.js');

class DeviceGroups extends Homey.App {


    onInit() {

        this.log('Device groups is running...');

        this.api = HomeyAPI.forCurrentHomey();

        // Init the Library
        this.library = new Library();

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

        let labelDevices = [];
        for (let i in groupedDevices) {
            labelDevices.push(groupedDevices[i].name);
        }
        labelDevices = labelDevices.join(', ');

        // Update the group settings.
        let ret = await group.setSettings({groupedDevices, labelDevices: labelDevices});

        await group.refresh();

        return ret;
    }

    async setGroupSettings(id, settings) {

        let group = await this.getGroup(id);

        // Update the group settings.
        let ret = await group.setSettings(group.settings);

        await group.refresh();

        return ret;
    }

    async setMethodForCapabilityOfGroup(id, capabilities) {

        let group = await this.getGroup(id);

        group.settings.capabilities = capabilities;

        // Update the device label
        // @todo move to method in device updateLabels
        // need to update to capability (method)
        let labelCapabilities = [];
        for (let key in group.settings.capabilities) {
            labelCapabilities.push(this.library.getCapability(key).title[this.i18n] + ' ('  +this.library.getMethod(group.settings.capabilities[key].method).title[this.i18n] +')')
        }
        group.settings.labelCapabilities = labelCapabilities.join(', ');

        // Update the group settings.
        let ret = await group.setSettings(group.settings);

        await group.refresh();

        return ret;
    }




}

module.exports = DeviceGroups;
