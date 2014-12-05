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

  this.client.subscribe(this.receiveTopic, {qos: this.options.qos});

  this.client.on('message', function(topic, data){
    try{
      console.log('received', topic, data);
      if(topic === self.receiveTopic){
        self.emit('data', data);
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

  this.client.publish(this.transmitTopic, data, {qos: this.options.qos});
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
  this.client = options.client;
  this.receiveTopic = options.receiveTopic;
  this.transmitTopic = options.transmitTopic;
  this.qos = options.qos || 0;

  function serialWrite(data){
    try{
      if(typeof data === 'string'){
        data = new Buffer(data, 'base64');
      }
      serialPort.write(data);
    }catch(exp){
      console.log('error reading message', exp);
    }
  }

  this.client.subscribe(this.receiveTopic, {qos: this.options.qos});

  serialPort.on('data', function(data){
    console.log('sending data:', data);
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data);
    }

    this.client.publish(this.transmitTopic, data, {qos: this.options.qos});
  });


  this.client.on('message', function(topic, data){
    try{
      if(topic === self.receiveTopic){
        console.log('received', topic, data);
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
