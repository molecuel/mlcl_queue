var should = require('should'),
  util = require('util'),
  assert = require('assert'),
  EventEmitter = require('events').EventEmitter;

describe('mlcl_queue', function() {

  var mlcl;
  var molecuel;
  var mlclq;
  var queue;

  before(function(done) {
    mlcl = function() {
      return this;
    };
    util.inherits(mlcl, EventEmitter);
    molecuel = new mlcl();

    molecuel.config = { };
    molecuel.config.queue = {
      uri: 'amqp://localhost'
    };

    if(process.env.NODE_ENV == 'dockerdev') {
      molecuel.config.queue = {
        uri: 'amqp://192.168.99.100'
      };
    }

    molecuel.log = console.log;
    done();
  });

  describe('singleton init', function() {
    it('should initialize', function(done) {
      mlclq = require('../index.js')(molecuel);
      molecuel.emit('mlcl::core::init:post', molecuel);
      molecuel.on('mlcl::queue::init:post', function(q) {
        queue = q;
        done();
      });
    });
  });

  describe('init queue', function() {
    it('should send to queue', function(done) {
      var chan = mlclq.getChannel();
      chan.then(function(ch) {
        ch.assertQueue('tasks');
        ch.sendToQueue('tasks', new Buffer('Queue element'));
        done();
      }).then(null, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should get from queue', function(done) {
      var chan = mlclq.getChannel();
      chan.then(function(ch) {
        ch.assertQueue('tasks');
        ch.consume('tasks', function(msg) {
          assert('Queue element' === msg.content.toString());
          ch.ack(msg)
          done();
        });
      }).then(null, function(err) {
        should.not.exist(err);
        done();
      })
    });
  });
});
