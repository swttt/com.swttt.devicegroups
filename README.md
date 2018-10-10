# Device Groups

With this app you can group devices with the same capabilities as one device.

After installing add a new groupingDevices from the devices tab.
Now select the group device's class. (e.g. Light).
On the next page you will see all the capabilities supported by this class, now chose the ones you need. (e.g. onoff and dim).
Now on the last page you will find all devices that match these capabilities, select the devices you want to group and finish the pairing process.

Now you have one device to control all the grouped devices.


---

### Issues & Feature requests

If you found any bugs you can create an issue on [github](https://github.com/swttt/com.swttt.devicegroups) .

Any other feature request can be added there as well.

---

### Donate

If you like this app, then consider to buy me a beer :)

[![Donate](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_donate_92x26.png)](https://paypal.me/BasJansen)

---

### Changelog

##### Testing notes

- Default behaviour of 'dim' changed to average of the group
- Default behaviour of 'onoff' changed to 'any' (on if any grouped devices are on) 

##### 1.2.0-alpha1
- API Update to 2.0.129
- Feedback on device status
- Added Ability to group read only capabilities.
- Allow device status to be calculated from grouped devices
- Device Classes (Categories) & Capabilities will now display correct name rather than tag.
- Device Classes (Categories) & Capabilities now support en/nl languages. 
- Addition of all new categories
- Addition of all new capabilities
- Groups will now refresh and update their devices immediately when changed in the settings, rather then waiting for  restart.
- Added class and capabilities to the device settings page, with in devices, Read Only.
- Change calculated method from the settings
- Added the ability to store your notes against a device group.
- Added Sensors (temp/power/lux)
- Added Power to Light & Socket category (TBC)
- Added i18n support to the device settings page labels, currently support en only. 
- Device pair screens show loading status.

##### 1.1.0
- Device Group editor

##### 1.0.0
- Initial release

---

### 1.2.0 Road Map

- Allow All to be selected in setup, to show all capabilities, if performance is not an issue.
- Update categories to be tiles & addition of icons for all categories. 

