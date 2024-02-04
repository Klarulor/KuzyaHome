const express = require(`express`);
const fs = require(`fs`);
const { devices, save } = require("./storage");
const {interact, updateValue} = require(`./arduino`);

const server = new express();

server.listen(7101, () => console.log('listening'))

const pathDevices = {};
for(const k in devices){
    const dev = devices[k];
    pathDevices[dev.path] = k;
    server.get(dev.path, (req, res) => {
        console.log(req.query);
        const path = req.path;
        const v = req.query.v;
        if(v == "{value}"){
            // request about status
            if(devices[pathDevices[path]]?.arduino?.type == "input"){
                checkArduino(pathDevices[path], res);
            }else{
                const json = toResponse(devices[pathDevices[path]].enabled, devices[pathDevices[path]].enabled ? "Включилось" : "Отключилось",
                devices[pathDevices[path]].enabled ? devices[pathDevices[path]].value : 0);
                console.log(json)
                res.end(json);
            }
            
        }else{
            if(v == "0"){
                // disable
                devices[pathDevices[path]].enabled = false;
            }else if(v == "1"){
                // enable
                devices[pathDevices[path]].enabled = true;
            }else{
                // change value of
                devices[pathDevices[path]].value = parseInt(v);
            }
            onRemoteStateChanging(pathDevices[path]);
            save();
            const json = toResponse(devices[pathDevices[path]].enabled, devices[pathDevices[path]].enabled ? "Включилось" : "Отключилось", 
            devices[pathDevices[path]].enabled ? devices[pathDevices[path]].value : 0);
            res.end(json);
        }
        
    })
    console.log(`registered path: ${dev.path}`);
}


function onRemoteStateChanging(ndx){
    if(devices[ndx].arduino){
        interact(ndx);
    }
}
async function checkArduino(ndx, res){
    await updateValue(ndx);
    const json = toResponse(devices[ndx].enabled, devices[ndx].enabled ? "Включилось" : "Отключилось",
        devices[ndx].enabled ? devices[ndx].value : 0);
    console.log(json)
    res.end(json);
}


function toResponse(enabled, text, value){
    return JSON.stringify({"status":enabled ? "ok" : "off","text":text,"value":value})
}


// const save = () => fs.writeFileSync("./src/devices.json", JSON.stringify(devices, null, 4));

