'use strict';

const Homey = require('homey');
const HomeyLite = require('../../lib/homey-lite/lib');

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
      const version = '1.2.0';

      let library = new HomeyLite();
      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.settings = {};
          pairingDevice.settings.capabilities = {};
          pairingDevice.data = {};
          pairingDevice.class = false;

          socket.on('startedClasses', function( data, callback ) {
              callback( null, library.getCategories() );
          });

          socket.on('addClass', function( data, callback ) {
              pairingDevice.class = data.class;
              pairingDevice.settings.labelClass = data.class;

              // @todo add check that icon exists while in alpha testing
              pairingDevice.icon = '/app/com.swttt.devicegroups.alpha/drivers/devicegroup/assets/icons/'+data.class+'.svg';
              pairingDevice.name = 'Grouped ' + data.class;
              callback( null, pairingDevice );

          });

          socket.on('getCapabilities', function( data, callback ) {
              callback( null, library.getCategories() );
          });

          socket.on('startedCapabilities', function( data, callback ) {

              let categoryCapabilities = library.getCategoryCapabilities(pairingDevice.class);
              let result = {};

              for (let i in categoryCapabilities) {
                  result[categoryCapabilities[i]] = library.getCapability(categoryCapabilities[i]);
              }
              callback(null, result)
          });

          socket.on('capabilitiesChanged', function( data, callback ) {

              pairingDevice.settings.capabilities = {};
              pairingDevice.capabilities = data.capabilities;

              // Set the capability method to the default
              // @todo allow this to be changed on the next screen
              let labelCapabilities = [];

              for (let i in data.capabilities) {
                  pairingDevice.settings.capabilities[data.capabilities[i]] = {};
                  pairingDevice.settings.capabilities[data.capabilities[i]].method = library.getCapability(data.capabilities[i]).method
              }

              pairingDevice.settings.labelCapabilities = data.capabilities.join();

              callback( null, pairingDevice );
          });

          socket.on('startedDevices', function( data, callback ) {
              var result = {};
                  result.pairingDevice = pairingDevice;
                  Homey.app.getDevices().then(res => {
                      result.devices = res;
                      callback(null, result);
                    })
                    .catch(error => callback(error, null));
          });

          socket.on('devicesChanged', function( data, callback ) {
              pairingDevice.settings.groupedDevices = data.devices;
              callback( null, pairingDevice );
          });

          // Adds the Unique ID, returns to the view for it to be added.
          socket.on('almostDone', function( data, callback ) {

              try {
                  pairingDevice.data.id = guid();
                  pairingDevice.store = {version : '1.2.0'};
                  callback( null, pairingDevice );
              } catch(error) {
                  callback( error, null );
              }

          });

      }
}

module.exports = DeviceGroupDriver;
