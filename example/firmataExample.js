'use strict';

var mqtt = require('mqtt');
var VirtualSerialPort = require('../index').SerialPort;

var firmata = require('firmata');


var client = mqtt.createClient(1883, 'localhost');

var sp = new VirtualSerialPort({
  client: client,
  transmitTopic: 'physicalDevice',
  receiveTopic: 'serialClient'
});

var board = new firmata.Board(sp);
board.on('ready', function(){
  console.log('actually connected to an arduino!');
  board.digitalWrite(13, 1);
});



