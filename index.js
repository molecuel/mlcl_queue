"use strict";
var azure = require("azure-sb");
var mlcl_queue = (function () {
    function mlcl_queue() {
        var _this = this;
        if (mlcl_queue._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        mlcl_queue._instance = this;
        mlcl_queue.molecuel.once('mlcl::core::init:post', function (molecuel) {
            if (molecuel.config.queue) {
                _this.bus = azure.createServiceBusService(molecuel.config.queue.uri);
                mlcl_queue.molecuel.emit('mlcl::queue::init:post', _this);
            }
            else {
                mlcl_queue.molecuel.log('error', 'mlcl_queue', 'Could not connect to service bus, no config');
                process.exit(1);
            }
        });
    }
    mlcl_queue.getInstance = function () {
        if (mlcl_queue._instance === null) {
            mlcl_queue._instance = new mlcl_queue();
        }
        return mlcl_queue._instance;
    };
    mlcl_queue.prototype.getBus = function () {
        return this.bus;
    };
    mlcl_queue.init = function (m) {
        mlcl_queue.molecuel = m;
        return mlcl_queue.getInstance();
    };
    mlcl_queue._instance = null;
    return mlcl_queue;
}());
module.exports = mlcl_queue.init;
