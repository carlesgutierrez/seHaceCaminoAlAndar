let timeSerialPortOpen = -1;

let arrayArdu;
let timeArdu = -1;
let distArdu = -1;
let speedArdu = -1;

let serial;
let latestData = "waiting for data";

let optionsArdu = { baudRate: 115200}; // change the data rate to whatever you wish


function setupArdu() {

 serial = new p5.SerialPort();

 serial.list();
  
//serial.open(portName, optionsArdu);
 serial.open(myPortCOM, optionsArdu);

 serial.on('connected', serverConnected);

 serial.on('list', gotList);

 serial.on('data', gotData);

 serial.on('error', gotError);

 serial.on('open', gotOpen);

 serial.on('close', gotClose);

 console.log("setupArdu()");
}


function serverConnected() {
 console.log("Connected to Server");
}

function gotList(thelist) {
 console.log("List of Serial Ports:");

 for (let i = 0; i < thelist.length; i++) {
  console.log(i + " " + thelist[i]);
 }
}

function gotOpen() {
 console.log("Serial Port is Open");
 bArduMode = true;
 timeSerialPortOpen = millis();
 console.log("***** bArdu TRUE *****");
}

function gotClose(){
 console.log("Serial Port is Closed");
 latestData = "Serial Port is Closed";
}

function gotError(theerror) {
 console.log(theerror);
 bArduMode = false;
 console.log("*****bArdu FALSE -> KEEP PLAYING with MOUSEX*****");
}

function gotData() {
    let currentString = serial.readLine();
    trim(currentString);
    if (!currentString) return;

    // las posiciones del array 0, 1, 2
    // distancia, tiempo y velocidad
    arrayArdu = splitTokens(currentString, ',');
    distArdu = arrayArdu[0];
    speedArdu = float(arrayArdu[1]); //TODO Joaku, 0 to 5 metros por segundos

    latestData = distArdu + ',' + speedArdu;
}


function drawArdu() {

 push()
 fill(255);
 stroke(0);
 textAlign(LEFT);
 textSize(20);
 text(latestData, width*.8, 50);
 pop();

 // Polling method
 /*
 if (serial.available() > 0) {
  let data = serial.read();
  ellipse(50,50,data,data);
 }
 */
}