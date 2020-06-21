// import {parse} from '@babel/parser';
// import generate from '@babel/generator';

// const code = 'class Example {}';
// const ast = parse(code);

// const output = generate(ast, { /* options */ sourceMaps}, code);
//import cors from 'cors';
//import express from 'express';

//import models, { connectDb } from 'models';
//import routes from './routes';
//import 'dotenv/config';
import { express } from 'express' ;
import cors from 'cors';
import bodyParser from 'body-parser';
const Honeybadger = require('honeybadger').configure(


  apiKey = '611ceb11'
);
Honeybadger.logger.level = 'info';
Honeybadger.metricsInterval = 10000;

const Promise = global.Promise || require("promise");
const exphbs  = require('express-handlebars');
const helpers = require("./lib/helpers");
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
const routes = require('./routes')
const models = require('./models/users');
var hbs = exphbs.create({
	helpers: helpers,

	// Uses multiple partials dirs, templates in "shared/templates/" are shared
	// with the client-side of the app (see below).
	partialsDir: [
		"shared/templates/",
		"views/partials/",
	],
});
const app = express();
app.use(Honeybadger.requestHandler); // Use *before* all other app middleware.
// app.use(myMiddleware);
connectDb().then(async () => {
  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
app.use(Honeybadger.metricsHandler);
app.use(Honeybadger.requestHandler);
app.use(bodyParser.urlencoded({ extended: false }));
// view engine setup
// Register `hbs` as our view engine using its bound `engine()` function.
//Middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views/'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(models, '/models');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/session', routes.session);
app.use('/users', routes.user);
app.use('/messages', routes.message);
//end middleware
function exposeTemplates (req, res, next) {
	// Uses the `ExpressHandlebars` instance to get the get the **precompiled**
	// templates which will be shared with the client-side of the app.
	hbs.getTemplates("shared/templates/", {
		cache: app.enabled("view cache"),
		precompiled: true,
	}).then(function (templates) {
		// RegExp to remove the ".handlebars" extension from the template names.
		var extRegex = new RegExp(hbs.extname + "$");

		// Creates an array of templates which are exposed via
		// `res.locals.templates`.
		templates = Object.keys(templates).map(function (name) {
			return {
				name: name.replace(extRegex, ""),
				template: templates[name],
			};
		});

		// Exposes the templates during view rendering.
		if (templates.length) {
			res.locals.templates = templates;
		}

		setImmediate(next);
	})
		.catch(next);
}
app.get("/", function (req, res) {
	res.render("home", {
		title: "Home",
	});
});

app.get("/yell", function (req, res) {
	res.render("yell", {
		title: "Yell",

		// This `message` will be transformed by our `yell()` helper.
		message: "hello world",
	});
});

app.get("/exclaim", function (req, res) {
	res.render("yell", {
		title: "Exclaim",
		message: "hello world",

		// This overrides _only_ the default `yell()` helper.
		helpers: {
			yell: function (msg) {
				return (msg + "!!!");
			},
		},
	});
});
app.get("/echo/:message?", exposeTemplates, function (req, res) {
	res.render("echo", {
		title: "Echo",
		message: req.params.message,

		// Overrides which layout to use, instead of the default "main" layout.
		layout: "shared-templates",

		partials: Promise.resolve({
			echo: hbs.handlebars.compile("<p>ECHO: {{message}}</p>"),
		}),
	});
});

//end of handlebars

// app.get('/', function (req, res) {
//   res.render('home');
// });

app.use(cors());
app.use(models, './models/')
app.use((req, res, next) => {
  req.context = {
    models,
    me: models.users[1],
  };
  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.User.deleteMany({}),
      models.Message.deleteMany({}),
    ]);
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});

app.use(express.static("public/"));
app.listen(3000, function () {
	console.log("express-handlebars example server listening on: 3000");
});
app.all('/fail', function (req, res) {
  Honeybadger.setContext({
    func: function() {},
    date: new Date(),
    user_id: '123',
    user_email: 'user@example.com',
    user_url: 'http://www.example.com/admin/user/123'
  });
  throw(new Error('This is a runtime error generated by the crywolf app.'));
});

app.use(Honeybadger.errorHandler);  // Use *after* all other app middleware.
//app.use(myErrorMiddleware);

module.exports = app;
