declare var amqplib: any;

declare module "amqplib" {
  export = amqplib;
}

declare var amqplibcb: any;

declare module "amqplib/callback_api" {
  export = amqplibcb;
}
