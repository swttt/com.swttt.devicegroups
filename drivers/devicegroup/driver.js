'use strict';

const Homey = require('homey');

class DeviceGroupDriver extends Homey.Driver {

  onPair( socket ) {
      let pairingDevice = {};
          pairingDevice.name = 'Grouped device';
          pairingDevice.settings = {};
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

      }


}

module.exports = DeviceGroupDriver;
