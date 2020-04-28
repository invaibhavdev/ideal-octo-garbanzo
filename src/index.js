const express = require('express');
require('dotenv').config();
require('./db/mongoose');
const Task = require('./models/task');

const app = express();

const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
// 	res.status(503).send("Please try later");
// })

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
	console.log('Server listening on port ' + port);
});