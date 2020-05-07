const app = require('./app');

const port = process.env.PORT || 3000;

// app.get('/', (req, res) => {
// 	res.send('<h1>Task Manager</h1>');
// })
app.listen(port, () => {
	console.log('Server listening on port ' + port);
});