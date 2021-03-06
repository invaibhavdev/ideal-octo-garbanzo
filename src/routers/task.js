const express = require('express');
const bcrypt = require('bcryptjs');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middlewares/auth');

// Create a task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
    	...req.body,
    	owner: req.user._id
    });

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


// Get all tasks
// Get /tasks?completed=true
// Get /tasks?limit=10
// Get /tasks?skip=2
// Get /tasks?sortBy=createdAt_asc
// Get /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};
	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}
	try {
		// const tasks = await Task.find({ owner: req.user._id });
		const tasks = await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate()

		res.send(req.user.tasks);
	} catch (e) {
		 res.status(500).send(e);
	}
});


// Get a specific task
router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOne({_id, owner: req.user._id});
		if (!task) {
			return res.status(404).json({ message: 'Task not found' });
		}
		res.json(task);
	} catch(e) {
		res.status(500).send(e);
	};
});

// Update a task
router.patch('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	// allowing only existing params w/ message
	const updates = Object.keys(req.body);
	const allowedUpdates = ['description', 'completed'];
	const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
	if (!isValidUpdate) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}
	try {
		// const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		const task = await Task.findOne({ _id, owner: req.user._id });
		updates.forEach((update) => {
			task[update] = req.body[update];
		});
		task.save();
		if (!task) {
			return res.status(404).send();
		}
		res.send(task)
	} catch (e) {
		res.status(400).send(e);
	}
});

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findOneAndDelete({ _id, owner: req.user._id});
		if (!task) {
			return res.status(404).json({ error: "The requested task doesn't exist" });
		}
		res.json(task);
	} catch (e) {
		res.status(500).json(e);
	}
});

module.exports = router;