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
      const i18n = 'en';

      let library = new HomeyLite();
      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.settings = {};
          pairingDevice.settings.capabilities = {};
          pairingDevice.data = {};
          pairingDevice.class = false;

          socket.on('startedClasses', function( data, callback ) {

              // set our i18n
              this.i18n = Homey.ManagerI18n.getLanguage();

              // Force i18n to en or nl, as we are accessing the i18n directly,
              // it wont fall back for us.
              this.i18n = (this.i18n == 'nl') ? 'nl' : 'en';

              callback( null, library.getCategories() );
          });

          socket.on('addClass', function( data, callback ) {
              pairingDevice.class = data.class;

              // @todo move all labels to separate function called from almostDone
              pairingDevice.settings.labelClass = library.getCategory(data.class).title[this.i18n];

              // @todo add check that icon exists while in alpha testing
              pairingDevice.icon = '/app/com.swttt.devicegroups/drivers/devicegroup/assets/icons/'+data.class+'.svg';
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
              let labelCapabilities = [];

              for (let i in data.capabilities) {
                  // reset
                  pairingDevice.settings.capabilities[data.capabilities[i]] = {};

                  // @todo move all labels to separate function called from almostDone
                  let details = library.getCapability(data.capabilities[i]);
                  pairingDevice.settings.capabilities[data.capabilities[i]].method = details.method;
                  labelCapabilities.push(details.title[this.i18n]);     // Find the i18n of the device, to be displayed

              }
                console.log(labelCapabilities);
              pairingDevice.settings.labelCapabilities = labelCapabilities.join(', ');

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

              // @todo move all lables to separate function called from almostDone
              let labelDevices = [];
              for (let i in data.devices) {
                  labelDevices.push(data.devices[i].name);
              }
              pairingDevice.settings.labelDevices = labelDevices.join(', ');
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
