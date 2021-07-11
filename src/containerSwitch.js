/** 
 *  Homekit Portainer Bridge
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */
const hap = require('hap-nodejs');
const config = require('../configs/config-dockerBridge.json');
const synoLibrary = require('./portainerLibrary');
const Accessory = hap.Accessory;
const Characteristic = hap.Characteristic;
const Service = hap.Service;


module.exports = class containerAccessory {
  constructor(name, id, endpoint, endpointName, state) {
    this.Switch = {
      label: name,
      name: name,
      id: id,
      endpoint: endpoint,
      endpointName: endpointName,
      setState: async function () {
        let action = null;
        if (this.state == true) {
          action = 'stop'
          this.state = false;
        }
        else {
          action = 'start'
          this.state = true;
        }
        try{
          const stateChange = await synoLibrary.query(payload=null,path='/api/endpoints/' + this.endpoint + '/docker/containers/' + this.id + '/' + action, true);
        }catch (e) {
          console.log(e.message)
        }
        console.log("Container - " + this.label + " state changed to: " + this.state);
        return this.state;
      },
      state: state,
      getState: async function () {
        const containerState = await synoLibrary.query(payload=null,path='/api/endpoints/' + this.endpoint + '/docker/containers/' + this.id + '/json');
        if (containerState != null) {
            let runningStatus = false;
            if(containerState.State.Running)
            {
              runningStatus = true;
            }
            this.state = runningStatus;
            this.accessory.getService(Service.Switch)
              .getCharacteristic(Characteristic.On)
              .updateValue(this.state);
            console.log("Container " + this.name + " - Checking state: " + this.state);
        }
        else {
          console.log("!!! ERROR WHILE TALKING TO " + config.portainer.fqdn + " empty payload: " + data);
        }
        return this.state;
      },
      uuid: hap.uuid.generate("docker.portainer" + id),
      accessory: null
    };
    console.log("Accessory " + name + " created.");
  }

  getAccessory() {
    if (!this.Switch.accessory) {
      let acc;
      acc = new Accessory(this.Switch.name, this.Switch.uuid);
      acc.username = this.Switch.username;
      acc.pincode = this.Switch.pincode;
      acc
        .addService(Service.Switch, this.Switch.name)
        .getCharacteristic(Characteristic.On)
        .on('set', async (value, cb) => {
          await this.Switch.setState(value);
          cb();
        })
        .on('get', async (cb) => {
          cb(null, await this.Switch.getState());
        });
      acc.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Model, this.Switch.id)
        .setCharacteristic(Characteristic.FirmwareRevision, "4.0.0")
        .setCharacteristic(Characteristic.Manufacturer, this.Switch.endpointName);
      this.Switch.accessory = acc;
      return acc;
    } else return this.Switch.accessory;
  } 
}