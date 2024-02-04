const fs = require(`fs`);


module.exports = class Storage{
    static devices = Storage.read();
    static read(){
        return JSON.parse(fs.readFileSync(`./src/devices.json`));
    }
    static updateStorage(){
        Storage.devices = Storage.read();
    }
    static save(){
        //console.log(Storage.devices)
        fs.writeFileSync("./src/devices.json", JSON.stringify(Storage.devices, null, 4));
    }
}