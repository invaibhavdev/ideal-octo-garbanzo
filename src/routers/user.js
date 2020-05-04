const express = require('express');
const router = new express.Router();
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const { sendWelcomeMail, sendDeleteMail } = require('../emails/account');
// Create a user
router.post('/users', async (req, res) => {
	const user  = new User(req.body);
	try {
		await user.save();
		sendWelcomeMail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get all users
router.get('/users/me', auth, async (req, res) => {
	try {
		// const users = await User.find({});
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});


// Get a specific user
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
});


// Update a user
router.patch('/users/me', auth, async (req, res) => {
	// const _id = req.params.id;
	// allowing only existing params w/ message
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}
	try {
		// commenting this since findByIdAndUpdate does not call the mongoose save function where we've put our password hash hook
		// so we'll change that to findById and then save it
		// const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});
		await req.user.save();
		res.send(req.user)
	} catch (e) {
		res.status(400).send(e);
	}
})

// Delete a user
router.delete('/users/me', auth, async (req, res) => {
	// const _id = req.params.id;
	try {
		await req.user.remove();
		sendDeleteMail(user.email, user.name);
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});


// Logging user in

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.send({user, token});
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post('/users/logout', auth, async(req, res) => {
	try {
		req.user.tokens =  req.user.tokens.filter((token) => {
			return token.token !== req.token
		})
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

const upload = multer({
	dest: 'avatars'
});

router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
	res.send();
});
module.exports = router;