const Homey = require('homey');
const HomeyLite = require('./lib/homey-lite/lib');

module.exports = [
  {
    // Get all groups.
    method : 'GET',
    path   : '/group',
    fn     : async (args) => {
      let groups = await Homey.app.getGroups();
      return groups.map(group => ({
        id    : group.getData().id,
        name  : group.getName(),
        class : group.getClass(),
      }));
    }
  },
  {
    // Get a specific group.
    method : 'GET',
    path   : '/group/:id',
    fn     : async (args) => {
      let group = await Homey.app.getGroup(args.params.id);
      return {
        id           : args.params.id,
        name         : group.getName(),
        class        : group.getClass(),
        capabilities : group.getCapabilities(),
        data         : group.getData(),
        settings     : group.getSettings(),
      };
    }
  },
  {
    // Update the grouped devices for a group.
    method : 'PUT',
    path   : '/group/:id',
    fn     : async (args) => {

      await Homey.app.setDevicesForGroup(args.params.id, args.body);
    }
  },
  {
    // Update the grouped devices for a group.
    method : 'PUT',
    path   : '/group/:id/settings',
    fn     : async (args) => {
      await Homey.app.setGroupSettings(args.params.id, args.body);
    }
  },
  {
    // Update the grouped devices for a group.
    method : 'PUT',
    path   : '/group/:id/capabilities',
    fn     : async (args) => {
      await Homey.app.setMethodForCapabilityOfGroup(args.params.id, args.body);
    }
  },
  {
    // Get a list of all devices.
    method : 'GET',
    path   : '/devices',
    fn     : async (args) => {
      let devices = await Homey.app.getDevices();
      return Object.values(devices);
    }
  },
  {
    method : 'GET',
    path   : '/library',
    fn     : async (args) => {
      let library = new HomeyLite();
      return await library.getJSON();
    }
  },
]
