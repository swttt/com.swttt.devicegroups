'use strict';

const Homey = require('homey');

function guid() {
 		function s4() {
 			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
 		}
 		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
 	}

class DeviceGroupDriver extends Homey.Driver {


  onPair( socket ) {

      /*
       * Add for future backwards compatibility checks : will require npm semver
       * Currently being stored with in the devices store object @ onAlmostDone
       */
      const version = '2.0.0';

      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.class     = false;
          pairingDevice.settings  = { capabilities: {} };
          pairingDevice.data = {};

          socket.on('startedClasses', function (data, callback) {
            callback(null, Homey.app.library.getCategories());
          });
          socket.on('addClass', function( data, callback ) {
              pairingDevice.class = data.class;
              pairingDevice.settings.labelClass = Homey.app.library.getCategory(data.class).title[Homey.app.i18n];
              pairingDevice.name = 'Grouped ' + pairingDevice.settings.labelClass;
              pairingDevice.icon =  '/app/' + Homey.manifest.id + '/drivers/devicegroup/assets/icons/' + data.class + '.svg';
              callback(null, pairingDevice);
          });
          socket.on('startedCapabilities', function (data, callback) {
              let categoryCapabilities = Homey.app.library.getCategory(pairingDevice.class).capabilities;
              let result = {};
              for (let i in categoryCapabilities) {
                result[categoryCapabilities[i]] = Homey.app.library.getCapability(categoryCapabilities[i]);
              }
              callback( null, result )
          });
          socket.on('capabilitiesChanged', function (data, callback) {
              pairingDevice.settings.capabilities = {};
              pairingDevice.capabilities = data.capabilities;

              // Set the capability method to the default
              for (let i in data.capabilities) {
                pairingDevice.settings.capabilities[data.capabilities[i]] = {}; // reset
                pairingDevice.settings.capabilities[data.capabilities[i]].method = Homey.app.library.getCapability(data.capabilities[i]).method;
              }
              callback( null, pairingDevice );
          });
          socket.on('startedDevices', function (data, callback) {
              let result = { devices: []};
                  result.pairingDevice = pairingDevice;
                  Homey.app.getDevices().then(res => {
                      result.devices = res;
                      callback(null, result);
                    })
                    .catch(error => callback(error, null));
          });
          socket.on('devicesChanged', function( data, callback ) {
              let ids = [];
              for (let i in data.devices) {
                ids.push(data.devices[i].id);
              }
              pairingDevice.settings.groupedDevices = ids;
              callback( null, pairingDevice );
          });
          // Adds the Unique ID, returns to the view for it to be added.
          socket.on('almostDone', function (data, callback) {
              try {
                pairingDevice.data.id = guid();
                pairingDevice.store = {version : this.version};
                callback(null, pairingDevice);
              } catch (error) {
                callback(error, null);
              }
          });
          socket.on('done', function (data, callback) {
            pairingDevice = null;
            callback(null, true);
          });
      }
}

module.exports = DeviceGroupDriver;
