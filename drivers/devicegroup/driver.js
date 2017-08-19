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
      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.settings = {};
          pairingDevice.data = {};
          socket.on('addClass', function( data, callback ) {
              pairingDevice.class = data.class;
              callback( null, pairingDevice );
          });
          socket.on('startedCapabilities', function( data, callback ) {
              callback( null, pairingDevice );
          });
          socket.on('capabilitiesChanged', function( data, callback ) {
              pairingDevice.capabilities = data.capabilities;
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
          socket.on('allmostDone', function( data, callback ) {
              pairingDevice.data.id = guid();
              callback( null, pairingDevice );
          });

      }


}

module.exports = DeviceGroupDriver;
