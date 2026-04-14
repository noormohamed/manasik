declare module 'koa-bodyparser' {
  import { Middleware } from 'koa';
  function bodyParser(options?: any): Middleware;
  export = bodyParser;
}

declare module '@koa/cors' {
  import { Middleware } from 'koa';
  function cors(options?: any): Middleware;
  export = cors;
}

declare module 'koa-cors' {
  import { Middleware } from 'koa';
  function cors(options?: any): Middleware;
  export = cors;
}

declare namespace Koa {
  interface Request {
    body?: any;
  }
  interface Context {
    request: Request & { body?: any };
  }
}
