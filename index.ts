/// <reference path="./typings/node/node.d.ts"/>

import azure = require('azure-sb');
import amqp = require('amqp10');

class mlcl_queue {

  private static _instance:mlcl_queue = null;
  public static molecuel;
  public bus: any;
  public client: any;

  constructor() {
    if(mlcl_queue._instance){
      throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
    }
    mlcl_queue._instance = this;

    mlcl_queue.molecuel.once('mlcl::core::init:post', async (molecuel) => {
      var Policy = amqp.Policy;
      this.client = new amqp.Client(Policy.Utils.RenewOnSettle(1, 1, Policy.ServiceBusQueue));

      const protocol = molecuel.config.queue.protocol || process.env.AZURE_SERVICEBUS_PROTOCOL;
      const sasKeyName = molecuel.config.queue.sasKeyName || process.env.AZURE_SERVICEBUS_SASKEYNAME;
      const sasKey = molecuel.config.queue.sasKey || process.env.AZURE_SERVICEBUS_SASKEY;
      const host = molecuel.config.queue.host || process.env.AZURE_SERVICEBUS_HOST;

      const address = protocol + '://' + encodeURIComponent(sasKeyName) + ':' + encodeURIComponent(sasKey) +
        '@' + host + '.servicebus.windows.net';
      const uri = 'Endpoint=sb://' + host + '.servicebus.windows.net/;SharedAccessKeyName=' + sasKeyName + ';SharedAccessKey=' + sasKey;

      this.bus = azure.createServiceBusService(molecuel.config.queue.uri);
      this.client.connect(address)
      .then(() => {
        mlcl_queue.molecuel.emit('mlcl::queue::init:post', this);
      })
      .error((err) => {
        mlcl_queue.molecuel.log('error', 'mlcl_queue', 'Error while connecting queue system: '+ err.message, err); 
      });
    });
  }

  public static getInstance():mlcl_queue {
    if(mlcl_queue._instance === null) {
      mlcl_queue._instance = new mlcl_queue();
    }
    return mlcl_queue._instance;
  }

  public getBus():any {
    return this.bus;
  }

  public ensureQueue(name, callback) {
    this.bus.createQueueIfNotExists(name, (err) => {
      if (err) {
        console.log('Failed to create queue: ' + name);
      }
      callback(err);
    });
  }

  public static init(m):mlcl_queue {
    mlcl_queue.molecuel = m;
    return mlcl_queue.getInstance();
  }
}

export = mlcl_queue.init;
