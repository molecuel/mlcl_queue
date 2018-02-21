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

    molecuel.log = {};
    molecuel.log.info = console.log;
    molecuel.log.error = console.log;
    molecuel.log.debug = console.log;
    molecuel.log.warn = console.log;

    molecuel.config = { };
    molecuel.config.queue = {
      // $env:AZURE_SERVICEBUS_PROTOCOL="";
      // $env:AZURE_SERVICEBUS_SASKEYNAME="";
      // $env:AZURE_SERVICEBUS_SASKEY="";
      // $env:AZURE_SERVICEBUS_HOST="";
    };

    molecuel.log = console.log;
    done();
  });

  describe('singleton init', function() {
    it('should initialize', function(done) {
      mlclq = require('../index.js')(molecuel);
      molecuel.on('mlcl::queue::init:post', function(q) {
        queue = q;
        done();
      });
      molecuel.emit('mlcl::core::init:post', molecuel);
    });

    it('should send', function(done) {
      const name = 'testtopic';
      mlclq.ensureQueue(name, (err) => {
        if (!err) {
          var sender = mlclq.client.createSender(name);
          sender.then(function(s) {
            var x = s.send({'company': 'inspirationlabs'});
            return x;
          })
          .then(function(result) {
            done();
          }).error((err) => {
            console.log('err');
            console.log(err);
          });
        }
      });
    });

  });

});
