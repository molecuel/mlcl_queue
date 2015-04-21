/// <reference path="./typings/node/node.d.ts"/>
/// <reference path="./typings/amqplib/amqplib.d.ts"/>

import amqplib = require('amqplib');

class mlcl_queue {

  private static _instance:mlcl_queue = null;
  public static molecuel;
  public amqconn:any;
  public amqchan:any;

  constructor() {
    if(mlcl_queue._instance){
      throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
    }
    mlcl_queue._instance = this;

    mlcl_queue.molecuel.once('mlcl::core::init:post', (molecuel) => {
      if(molecuel.config.queue) {
        this.amqconn = amqplib.connect(molecuel.config.queue.uri);
        this.amqconn.then((conn) => {
          this.amqchan = conn.createChannel();
          mlcl_queue.molecuel.emit('mlcl::queue::init:post', this);
        }).then(null, function(err) {
          mlcl_queue.molecuel.log.error('mlcl_queue', 'Error while connecting queue system: '+ err);
          process.exit(1);
        });
      }
    });
  }

  public static getInstance():mlcl_queue {
    if(mlcl_queue._instance === null) {
      mlcl_queue._instance = new mlcl_queue();
    }
    return mlcl_queue._instance;
  }

  public getChannel():any {
    return this.amqchan;
  }

  public static init(m):mlcl_queue {
    mlcl_queue.molecuel = m;
    return mlcl_queue.getInstance();
  }
}

export = mlcl_queue.init;
