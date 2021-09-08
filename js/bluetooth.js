//var serviceUuid = parseInt(0xFFE0); 
//var characteristicUuid = parseInt(0xFFE1);
//var bluetoothDevice;
var myCharacteristic;
var currentMode = 1;


function onButtonClick() {
  let serviceUuid = 0xFFE0;
  serviceUuid = parseInt(serviceUuid);

  let characteristicUuid = 0xFFE2;
  characteristicUuid = parseInt(characteristicUuid);


  debugLog('Requesting any Bluetooth Device...');
  navigator.bluetooth.requestDevice({
   // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true,
      optionalServices: [serviceUuid]})
  .then(device => {
    debugLog('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    debugLog('Getting Service...');
    return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    debugLog('Getting Characteristic...');
    return service.getCharacteristic(characteristicUuid);
  }).then(characteristic => {
    debugLog('Getting Descriptor...');
   myCharacteristic = characteristic;
  }).catch(error => {
    debugLog('Argh! ' + error);
  });
}
function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  console.log('Received ' + value);
  // TODO: Parse Heart Rate Measurement value.
  // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
}

function connect() {
  exponentialBackoff(3 /* max retries */, 2 /* seconds delay */,
    function toTry() {
      time('Connecting to Bluetooth Device... ');
      return bluetoothDevice.gatt.connect();
    },
    function success() {
      debugLog('> Bluetooth Device connected. Try disconnect it now.');
    },
    function fail() {
      time('Failed to reconnect.');
    });
}
function onButtonClickTwo()
{
  let encoder = new TextEncoder('utf-8');
  let value = currentMode + document.getElementById("colorpicker2").value + document.getElementById("colorpicker2").value;
  debugLog('Setting Characteristic User Description...');
  myCharacteristic.writeValue(encoder.encode(value));
}

function onDisconnected() {
  debugLog('> Bluetooth Device disconnected');
  connect();
}

/* Utils */

// This function keeps calling "toTry" until promise resolves or has
// retried "max" number of times. First retry has a delay of "delay" seconds.
// "success" is called upon success.
function exponentialBackoff(max, delay, toTry, success, fail) {
  toTry().then(result => success(result))
  .catch(_ => {
    if (max === 0) {
      return fail();
    }
    time('Retrying in ' + delay + 's... (' + max + ' tries left)');
    setTimeout(function() {
      exponentialBackoff(--max, delay * 2, toTry, success, fail);
    }, delay * 1000);
  });
}

function time(text) {
  debugLog('[' + new Date().toJSON().substr(11, 8) + '] ' + text);
}
function debugLog(error)
{
	document.getElementById("error").innerHTML += error; 
}