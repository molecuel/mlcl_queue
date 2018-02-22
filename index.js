"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const azure = require("azure-sb");
const amqp = require("amqp10");
class mlcl_queue {
    constructor() {
        if (mlcl_queue._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        mlcl_queue._instance = this;
        mlcl_queue.molecuel.once('mlcl::core::init:post', (molecuel) => __awaiter(this, void 0, void 0, function* () {
            var Policy = amqp.Policy;
            this.client = new amqp.Client(Policy.Utils.RenewOnSettle(1, 1, Policy.ServiceBusQueue));
            const protocol = molecuel.config.queue.protocol || process.env.AZURE_SERVICEBUS_PROTOCOL;
            const sasKeyName = molecuel.config.queue.sasKeyName || process.env.AZURE_SERVICEBUS_SASKEYNAME;
            const sasKey = molecuel.config.queue.sasKey || process.env.AZURE_SERVICEBUS_SASKEY;
            const host = molecuel.config.queue.host || process.env.AZURE_SERVICEBUS_HOST;
            const address = protocol + '://' + encodeURIComponent(sasKeyName) + ':' + encodeURIComponent(sasKey) +
                '@' + host + '.servicebus.windows.net';
            const uri = 'Endpoint=sb://' + host + '.servicebus.windows.net/;SharedAccessKeyName=' + sasKeyName + ';SharedAccessKey=' + sasKey;
            this.bus = azure.createServiceBusService(uri);
            this.client.connect(address)
                .then(() => {
                mlcl_queue.molecuel.emit('mlcl::queue::init:post', this);
            })
                .error((err) => {
                mlcl_queue.molecuel.log('error', 'mlcl_queue', 'Error while connecting queue system: ' + err.message, err);
            });
        }));
    }
    static getInstance() {
        if (mlcl_queue._instance === null) {
            mlcl_queue._instance = new mlcl_queue();
        }
        return mlcl_queue._instance;
    }
    getBus() {
        return this.bus;
    }
    ensureQueue(name, callback) {
        this.bus.createQueueIfNotExists(name, (err) => {
            if (err) {
                console.log('Failed to create queue: ' + name);
            }
            callback(err);
        });
    }
    static init(m) {
        mlcl_queue.molecuel = m;
        return mlcl_queue.getInstance();
    }
}
mlcl_queue._instance = null;
module.exports = mlcl_queue.init;
