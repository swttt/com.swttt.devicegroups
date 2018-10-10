# Todo


## 1.2.0

### Features

- Allow All to be selected in setup, to show all capabilities, if performance is not an issue.
- Update default polling from from 3 to 10. 

### UX 

- Update categories to be tiles & addition of icons for all categories. 
- Clean up of capabilities (and changing methods) upon app settings, currently proof of concept. 

### Refactor

- Move update label to the device class, called upon refresh(). 


### Performance

- Investigate storing the groupedDevices with in device class rather then calling api on every call. 


### Testing

https://docs.google.com/spreadsheets/d/1GAjOZUtZgUeg95zHC7CNl6wXo-iqTMqeUiyN16OXlxM/edit#gid=0


### Future
- Move all i18n back into the locales folder/structure, instead of the homey-lite.
- Update polling frequency based off of the specific capability. 
