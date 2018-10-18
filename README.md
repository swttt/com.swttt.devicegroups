

# Device Groups

Please note alpha3, is compltely stable and optimised, however there is a memory leak with in the Athom code,
In order to enable full functionality uncomment line 182 of device.js (await device.refreshCapabilities()), this will have the side
effect of causing memory to increase continuous until the soft ceiling of 100MB.

As this is Athom code which I have no control over, a fix by them or a completely new approach is required.

---



With this app you can group devices with the same capabilities as one device.

After installing add a new groupingDevices from the devices tab.
Now select the group device's class. (e.g. Light).
On the next page you will see all the capabilities supported by this class, now chose the ones you need. (e.g. onoff and dim).
Now on the last page you will find all devices that match these capabilities, select the devices you want to group and finish the pairing process.

Now you have one device to control all the grouped devices.


---

### Device Groups Settings

There are two sets of settings associated with device groups, first the settings available from the device group card. Which offers overview information 
ability to change the frequency of how often devices are checked for changes. 

More importantly is the application settings, which can be accessed by click on your Homeys settings then the Device Groups link. 
It is from here, 

- You can change which devices are in a group. eg. *Add or remove a new light to a group*
- Set the feedback information for a specific group eg. *The On off button should only be on if all lights are on.*
- How grouped information is calculated for a specific capability on a specific group. - *Grouped temperature sensors should display the average of the entire group.*


---

### Issues & Feature requests

If you found any bugs you can create an issue on [github](https://github.com/swttt/com.swttt.devicegroups) .

Any other feature request can be added there as well.

---

### Donate

If you like this app, then consider buying swttt a beer :)

[![Donate](https://www.paypalobjects.com/webstatic/en_US/i/btn/png/btn_donate_92x26.png)](https://paypal.me/BasJansen)

---

#### Testing notes

Currently (in alpha testing), this application will **not** overwrite the stable version of the application. Instead installing as "(alpha) Device Groups"
This is to allow testing with out breaking any existing devices/flows. 

---

### Changelog


##### 1.2.0-alpha2

- Reliability, Stability and Performance


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

