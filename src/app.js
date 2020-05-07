const express = require('express');
// require('dotenv').config();
require('./db/mongoose');
const Task = require('./models/task');

const app = express();

app.use((req, res, next) => {
	// res.status(503).send("Please try later");
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
})

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;