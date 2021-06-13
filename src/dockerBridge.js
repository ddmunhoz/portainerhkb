const config = require('../configs/config-dockerBridge.json');
const { Bridge, uuid, Categories } = require('hap-nodejs');
const containerAccessory = require('./containerSwitch');
const synoLibrary = require('./portainerLibrary');

const bridge = new Bridge('Docker Docker-HKB', uuid.generate('Docker Docker-HKB'));
let countController = 0
let isBridgePublished = false

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
    let exclude = config.portainer.exclude;
    const endpoinst = await synoLibrary.query(payload=null,path='/api/endpoints');

    var containers = [];
    if (endpoinst.length != 0) {
        for (let key in endpoinst) {
            let nodeContainerList = await synoLibrary.query(payload=null,path='/api/endpoints/' + endpoinst[key].Id + '/docker/containers/json?all=1');
            nodeContainerList.forEach(function (element) {
                element.Endpoint = endpoinst[key].Id;
              });
            containers.push(nodeContainerList)
        }

        let allContainers = [].concat.apply([], containers);

        for (let key in allContainers) {
            let cleanContainerName = allContainers[key]['Names'][0];
            cleanContainerName = cleanContainerName.replace(/[^a-zA-Z0-9]/g, "");
            const dev = new containerAccessory(cleanContainerName, allContainers[key].Id, allContainers[key].Endpoint, allContainers[key].State);
            bridge.addBridgedAccessories({
                accessory: dev.getAccessory()
            });
        }

    }
    countController++
}

looper = setInterval(async function f() {
    if(!isBridgePublished){
        await thePublisher();
    }
}, 5 * 1000);

buildContainerAccessories();