const fs = require('fs');
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');

const app = new Koa();
const router = new Router();

app
	.use(router.routes())
  .use(router.allowedMethods())
  .use(serve(__dirname + '/dist'));

router.get('/favicon.ico', (ctx, next) => {
	ctx.body = fs.readFileSync(__dirname + '/dist/favicon.png');
});

app.use(async ctx => {
	console.log('middleware');
});

app.listen(3000);
