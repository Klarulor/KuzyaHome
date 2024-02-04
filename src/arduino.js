const { devices, save } = require('./storage');

const SerialPort = require('serialport').SerialPort;
const port = new SerialPort({ path: 'COM8', baudRate: 9600 })

// port.write('main screen turn on', function(err) {
//   if (err) {
//     return console.log('Error on write: ', err.message)
//   }
//   console.log('message written')
// })

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message)
})

let opened = false;


let waitingPromise;

port.on(`data`,data => {
    if(!opened){
        opened = true;
        onOpen();
        return;
    }
    console.log(`|${data.toString()}|`)
    if(waitingPromise){
        let resData;
        try{
            resData = parseInt(data.toString());
        }catch{}
        if(!resData)
            resData = data.toString();
        waitingPromise(resData);
    }
        
})

function onOpen(){
    console.log("Port is open");
    // port.write("11054\n") //init analog 054 port
    // port.write("20053\n"); // read analog 054 port

    // port.write("10053\n") // init digital 13 port
    // port.write("310531\n") // send HIGH to 13 digital port
    
    // initPort(true, 53);
    // initPort(false, 54);
    // let flag =false;
    // setInterval(async () => {
    //     // writePort(flag, 53, 1);
    //     // flag = !flag;
    //     const result = await readPort(false, 54);
    //     console.log(result)
    //     writePort(true, 53,result > 400)
        
    // }, 250);
    initPorts();
    initConfigValues();
    port.write(`41005\n`)
}


function initPorts(){
    for(const k in devices){
        const device = devices[k];
        if(device.arduino){
            initPort(device.arduino.type, device.arduino.pin);
            console.log(device.path, device.arduino.type, device.arduino.pin);
        }
    }
}

function initConfigValues(){
    for(const k in devices){
        const device = devices[k];
        if(device.arduino){
            if(isDigitalPin(device.arduino.pin)){
                if(device.enabled){
                    writePort(true, device.arduino.pin, 1);
                }
            }else{
                if(device.enabled){
                    writePort(false, device.arduino.pin, device.value);
                }
            }
        }
    }
}

module.exports.interact = (ndx, res) =>{
    const device = devices[ndx];
    if(device.arduino.type == "output"){
        const v = device.value || device.enabled ? 1 : 0;
        writePort(isDigitalPin(device.arduino.pin), device.arduino.pin, v);
    }else{
       
    }
}

module.exports.updateValue = (ndx) => {
    const device = devices[ndx];
    return new Promise(async res => {
        const temp = await readDallasTemperatureSensor(device.arduino.pin);
        console.log('cpin',device.arduino.pin, device.arduino.pin.length, toTrippleString(1), toTrippleString(10), toTrippleString(100))
        if(temp > 0){
            devices[ndx].value = temp;
            console.log("new value: ",temp)
            save();
        }
        res();
    })
}












function initPort(isOutput, pPort){
    const str = `1${isOutput ? "1" : "0"}${toTrippleString(pPort)}\n`;
    port.write(str);
}
function writePort(isDigital, pPort, value){
    const v = typeof(value) == 'number' ? value : (value === true ? 1 : 0);
    const str = `3${isDigital ? "1" : "0"}${toTrippleString(pPort)}${isDigital ? v : toTrippleString(v)}\n`;
    port.write(str);
    console.log(str)
}
function readPort(isDigital, pPort){
    const str = `2${isDigital ? "1" : "0"}${toTrippleString(pPort)}\n`;
    port.write(str);
    return new Promise(res => {
        waitingPromise = res;
    })
}

function readDallasTemperatureSensor(pin){
    return new Promise(async res => {
        const str = `41${toTrippleString(pin)}\n`;
        console.log(str)
        port.write(str);
        const data = await readPort(isDigitalPin(pin), pin);
        res(data);
    })
}

function toTrippleString(num){
    let str = "";
    for(let i = 0; i < 3 - `${num}`.length; i++){
        str += "0";
    }
    str += `${num}`
    return str;
}

function isDigitalPin(pin){
    return !(parseInt(`${pin}`) >= 54 && parseInt(`${pin}`) <= 69);
}