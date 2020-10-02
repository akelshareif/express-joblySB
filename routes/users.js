const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');
const userSchema = require('../schemas/userSchema.json');
const User = require('../models/userModel');

router.get('/', async (req, res, next) => {
    try {
        const users = await User.getAll();
        return res.status(200).json({ users });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, userSchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const user = await User.create(req.body);

        return res.status(201).json({ user });
    } catch (e) {
        return next(e);
    }
});

router.get('/:username', async (req, res, next) => {
    try {
        const user = await User.getOne(req.params.username);

        return res.status(200).json({ user });
    } catch (e) {
        return next(e);
    }
});

router.patch('/:username', async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, userSchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const user = await User.update(req.params.username, req.body);
        return res.status(200).json({ user });
    } catch (e) {}
});

router.delete('/:username', async (req, res, next) => {
    try {
        const result = await User.remove(req.params.username);

        return res.status(200).json(result);
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
