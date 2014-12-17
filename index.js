'use strict';

var util = require('util');
var stream = require('stream');
var _ = require('lodash');



function MQTTSerialPort(options) {
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic;
  this.qos = options.qos || 0;

  this.buffer = null;
  this.lastCheck = 0;
  this.lastSend = 0;

  var self = this;

  this.client.subscribe(this.receiveTopic, {qos: this.qos});

  this.client.on('message', function(topic, data){
    try{
      if(topic === self.receiveTopic){
        self.emit('data', new Buffer(data, 'base64'));
      }

    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });

}

util.inherits(MQTTSerialPort, stream.Stream);


MQTTSerialPort.prototype.open = function (callback) {
  this.emit('open');
  if (callback) {
    callback();
  }

};



MQTTSerialPort.prototype.write = function (data, callback) {

  console.log('sending data:', data);

  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data);
  }

  this.client.publish(this.transmitTopic, data.toString('base64'), {qos: this.qos});
};



MQTTSerialPort.prototype.close = function (callback) {
  console.log('closing');
  if(callback){
    callback();
  }
};

MQTTSerialPort.prototype.flush = function (callback) {
  console.log('flush');
  if(callback){
    callback();
  }
};

MQTTSerialPort.prototype.drain = function (callback) {
  console.log('drain');
  if(callback){
    callback();
  }
};


function bindPhysical(options){
  var client = options.client;
  var serialPort = options.serialPort;
  var receiveTopic = options.receiveTopic;
  var transmitTopic = options.transmitTopic;
  var qos = options.qos || 0;

  function serialWrite(data){
    try{
      if(typeof data === 'string'){
        data = new Buffer(data, 'base64');
      }
      console.log('writing to serialPort', data);
      serialPort.write(data);
    }catch(exp){
      console.log('error reading message', exp);
    }
  }

  client.subscribe(receiveTopic, {qos: qos});

  serialPort.on('data', function(data){
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    client.publish(transmitTopic, data.toString('base64'), {qos: qos});
  });


  client.on('message', function(topic, data, packet){
    try{
      if(topic === receiveTopic){
        serialWrite(data);
      }
    }catch(exp){
      console.log('error on message', exp);
      //self.emit('error', 'error receiving message: ' + exp);
    }
  });


}


module.exports = {
  SerialPort: MQTTSerialPort,
  bindPhysical: bindPhysical
};
