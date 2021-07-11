/** 
 *  Homekit Portainer Bridge
 *  
 *  by Diego Munhoz - munhozdiego@live.com - https://diegomunhoz.com
 */

const config = require('../configs/config-dockerBridge.json');
const { Bridge, uuid, Categories, Service, Characteristic } = require('hap-nodejs');
const containerAccessory = require('./containerSwitch');
const synoLibrary = require('./portainerLibrary');

const bridge = new Bridge('Docker Docker-HKB', uuid.generate('Docker Docker-HKB'));
let countController = 0;
let isBridgePublished = false;

//Load Configs
const emiterInterval  = (config.portainer.emiterInterval  === undefined) ? 120 : config.portainer.emiterInterval;
const cleanupInterval = (config.portainer.cleanupInterval === undefined) ? 300 : config.portainer.cleanupInterval;
const exclude         = (config.portainer.exclude     === undefined) ? JSON.parse('[{"name": ""}]') : config.portainer.exclude;

function thePublisher() {
    if (countController == 1){
        bridge.publish({
            username: config.bridge.mac,
            port: config.bridge.port,
            pincode: config.bridge.pincode,
            category: Categories.BRIDGE
        });
        console.log(config.bridge.name + " HomeKit Bridge published!");
        isBridgePublished = true;
        clearInterval(looper);
    }
}

async function buildContainerAccessories() {
    let excludedContainers = exclude;
    const endpoinst = await synoLibrary.query(payload=null,path='/api/endpoints');

    var containers = [];
    if (endpoinst.length != 0) {
        for (let key in endpoinst) {
            let nodeContainerList = await synoLibrary.query(payload=null,path='/api/endpoints/' + endpoinst[key].Id + '/docker/containers/json?all=1');
            
            //Adds Endpoint ID to each container
            nodeContainerList = nodeContainerList.map(item => {
                return { ...item, Endpoint: endpoinst[key].Id};
            });
            containers.push(nodeContainerList)
        }

        //Clear portainer Names removing / from it
        let allContainers = [].concat.apply([], containers);
        allContainers = allContainers.map(item => {
              return { ...item, Names: item.Names[0].replace(/[^a-zA-Z0-9]/g, "")};
          });

        //Remove containers from array based on config settings
        let filteredContainers = allContainers
            .filter(item1 => !excludedContainers.some(item2 => (item2.name === item1.Names))); 

        //Create accessories
        for (let key in filteredContainers) {
            let endpointName =  endpoinst.filter(o => o.Id === filteredContainers[key].Endpoint);  
            var bridgeAcc = bridge.bridgedAccessories.filter(function (obj) {
                return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value === filteredContainers[key].Id);
            });
            if (bridgeAcc.length === 0) {
                const dev = new containerAccessory(filteredContainers[key].Names, filteredContainers[key].Id, filteredContainers[key].Endpoint, endpointName[0].Name, filteredContainers[key].State);
                bridge.addBridgedAccessories({
                    accessory: dev.getAccessory()
                });
            }
            else{
                var containerAccessories = bridge.bridgedAccessories.filter(function (obj) {
                    return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('4.0.0'));
                });
                var res = containerAccessories.filter(item1 =>
                    !filteredContainers.some(item2 => (item2.Id === item1.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Model).value)))
                if (res.length != 0) {
                    for (var cont in res) {
                        bridge.removeBridgedAccessory(res[cont]);
                    }
                }
            }
        }
    }
    countController++
}

async function emiter(){
    var containerAccessories = bridge.bridgedAccessories.filter(function (obj) {
        return (obj.getService(Service.AccessoryInformation).getCharacteristic(Characteristic.FirmwareRevision).value.includes('4.0.0'));
    });
    for (let acc in containerAccessories) {
        var testte = containerAccessories[acc].getService(Service.Switch).getCharacteristic(Characteristic.On);
        var rola = testte.getValue();
        console.log('')
    }
}

looper = setInterval(async function f() {
    if(!isBridgePublished){
        await thePublisher();
    }
}, 5 * 1000);

emiterNoop = setInterval(async function f() {
    if(isBridgePublished){
        await emiter();
    }
}, emiterInterval * 1000);

cleaner = setInterval(async function f() {
        await buildContainerAccessories();
}, cleanupInterval * 1000);

buildContainerAccessories();