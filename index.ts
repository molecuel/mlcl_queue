/// <reference path="./typings/node/node.d.ts"/>

import azure = require('azure-sb');

class mlcl_queue {

  private static _instance:mlcl_queue = null;
  public static molecuel;
  public bus: any;

  constructor() {
    if(mlcl_queue._instance){
      throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
    }
    mlcl_queue._instance = this;

    mlcl_queue.molecuel.once('mlcl::core::init:post', (molecuel) => {
      if(molecuel.config.queue) {
        this.bus = azure.createServiceBusService(molecuel.config.queue.uri);
        mlcl_queue.molecuel.emit('mlcl::queue::init:post', this);
      } else {
        mlcl_queue.molecuel.log('error', 'mlcl_queue', 'Could not connect to service bus, no config');
        process.exit(1);
      }
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

  public static init(m):mlcl_queue {
    mlcl_queue.molecuel = m;
    return mlcl_queue.getInstance();
  }
}

export = mlcl_queue.init;
