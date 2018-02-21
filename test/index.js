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
      uri: 'Endpoint=sb://npm.servicebus.windows.net/;SharedAccessKeyName=yourkey;SharedAccessKey=XXX=',
    };

    if(process.env.NODE_ENV == 'dockerdev') {
      molecuel.config.queue = {
        uri: 'Endpoint=sb://npm.servicebus.windows.net/;SharedAccessKeyName=yourkey;SharedAccessKey=XXX=',
      };
    }

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
  });

});
