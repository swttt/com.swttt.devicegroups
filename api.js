const Homey = require('homey');

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
    // Get a list of all devices.
    method : 'GET',
    path   : '/devices',
    fn     : async (args) => {
      let devices = await Homey.app.getDevices();
      return Object.values(devices);
    }
  },
]
