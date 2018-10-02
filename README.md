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

##### 1.2.0
- API Update to 2.0.129
- Feedback on device status
- Ability to group read only capabilities
- Allow device status to be calculated from grouped devices
- Device Classes (Categories) & Capabilities will now display correct name rather than tag.
- Device Classes (Categories) & Capabilities now support en/nl languages. 
- Removal of  Dim capability from heater devices (now use target_temperature)
- Addition of all new devices 

##### 1.1.0
- Device Group editor

##### 1.0.0
- Initial release

### 1.2.0 Road Map

- Addition of all new capabilities
- Allow "All"  to be selected in setup, to show all capabilities, if performance is not an issue.
- Update capability setup screen to initially show loading status.
- Change calculated method from the settings
- ~~Allow calculated method to be changed when adding a device.~~ 
- Alphabetical ordering of items. 
- Add translations 
