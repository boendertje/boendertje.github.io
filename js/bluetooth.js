var serviceUuid = 0xFFE0; 
var characteristicUuid = 0xFFE1;
var bluetoothDevice;
var myDescriptor;

function onButtonClick() {
  bluetoothDevice = null;
  debugLog('Requesting any Bluetooth Device...');
  navigator.bluetooth.requestDevice({
     // filters: [...] <- Prefer filters to save energy & show relevant devices.
     acceptAllDevices: true})
  .then(device => {
		bluetoothDevice = device;
		bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
		connect();
  }).then(server => {
		log('Getting Service...');
		return server.getPrimaryService(serviceUuid);
  })
  .then(service => {
    log('Getting Characteristic...');
    return service.getCharacteristic(characteristicUuid);
  }).then(characteristic => {
    log('Getting Descriptor...');
    return characteristic.getDescriptor('gatt.characteristic_user_description');
  })
  .then(descriptor => {

    myDescriptor = descriptor;
    log('Reading Descriptor...');
    return descriptor.readValue();
  }).then(value =>{
	debugLog(value);  
  })
  .catch(error => {
    debugLog('Argh! ' + error);
  });
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