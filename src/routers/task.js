const express = require('express');
const bcrypt = require('bcryptjs');
const router = new express.Router();
const Task = require('../models/task');

// Create a task
router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


// Get all tasks
router.get('/tasks', async (req, res) => {
	try {
		const tasks = await Task.find({});
		res.send(tasks);
	} catch (e) {
		 res.status(500).json({ error: e });
	}
});


// Get a specific task
router.get('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findById(_id);
		if (!task) {
			return res.status(404).json({ message: 'Task not found' });
		}
		res.json(task);
	} catch(e) {
		res.status(500).send(e);
	};
});

// Update a task
router.patch('/tasks/:id', async (req, res) => {
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
		const task = await Task.findById(_id);
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
router.delete('/tasks/:id', async (req, res) => {
	const _id = req.params.id;
	try {
		const task = await Task.findByIdAndDelete(_id);
		if (!task) {
			return res.status(404).json({ error: "The requested task doesn't exist" });
		}
		res.json(task);
	} catch (e) {
		res.status(500).json(e);
	}
});

module.exports = router;