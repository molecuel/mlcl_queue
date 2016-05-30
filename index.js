"use strict";
var amqplib = require('amqplib');
var mlcl_queue = (function () {
    function mlcl_queue() {
        var _this = this;
        if (mlcl_queue._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        mlcl_queue._instance = this;
        mlcl_queue.molecuel.once('mlcl::core::init:post', function (molecuel) {
            if (molecuel.config.queue) {
                _this.amqconn = amqplib.connect(molecuel.config.queue.uri);
                _this.amqconn.then(function (conn) {
                    _this.amqchan = conn.createChannel();
                    mlcl_queue.molecuel.emit('mlcl::queue::init:post', _this);
                }).then(null, function (err) {
                    mlcl_queue.molecuel.log('error', 'mlcl_queue', 'Error while connecting queue system: ' + err.message, err);
                    process.exit(1);
                });
            }
        });
    }
    mlcl_queue.getInstance = function () {
        if (mlcl_queue._instance === null) {
            mlcl_queue._instance = new mlcl_queue();
        }
        return mlcl_queue._instance;
    };
    mlcl_queue.prototype.getChannel = function () {
        return this.amqchan;
    };
    mlcl_queue.init = function (m) {
        mlcl_queue.molecuel = m;
        return mlcl_queue.getInstance();
    };
    mlcl_queue._instance = null;
    return mlcl_queue;
}());
module.exports = mlcl_queue.init;
