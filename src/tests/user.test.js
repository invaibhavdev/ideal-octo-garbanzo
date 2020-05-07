const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');

const User = require('../models/user');

const userOneId = new mongoose.Types.ObjectId();

const userOne = {
	_id: userOneId,
	name: 'Mike',
	email: 'mike@example.com',
	password: '87654321',
	tokens: [{
		token: jwt.sign({ _id: userOneId }, process.env.JWT_SIGNATURE)
	}]
};

beforeEach(async() => {
	await User.deleteMany();
	await new User(userOne).save();
})

test('Should signup a new user', async() => {
	const response = await request(app).post('/users').send({
		name: 'Andrew',
		email: 'andrew@example.com',
		password: '12345678'
	}).expect(201)
	// Assert that the database has changed correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	// Assertions about the response
	expect(response.body).toMatchObject({
		user: {
			name: 'Andrew',
			email: 'andrew@example.com'
		},
		token: user.tokens[0].token
	});
});

test('Should login existing user', async() => {
	const response = await request(app).post('/users/login').send({
			email: userOne.email,
			password: userOne.password
		}).expect(200)
	// expect(response.body.token).toBe()
	const user = await User.findById(userOneId);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existent users', async() => {
	await request(app).post('/users/login').send({
		email: 'mick@example.com',
		password: '87654321'
	}).expect(400)
});

test('Should get user profile successfully for authenticated users', async() => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.expect(200);
});

test('Should not get user profile for unauthenticated users', async() => {
	await request(app)
		.get('/users/me')
		.expect(401);
});

test('Should delete account for authenticated user', async() => {
	const response = await request(app)
			.delete('/users/me')
			.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
			.expect(200)
	const user = await User.findById(userOneId);
	expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async() => {
	await request(app)
		.delete('/users/me')
		.expect(401)
});