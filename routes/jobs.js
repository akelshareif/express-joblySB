const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');
const jobSchema = require('../schemas/jobSchema.json');
const Job = require('../models/jobModel');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const jobs = await Job.getAll(req.query);
        return res.status(200).json({ jobs });
    } catch (e) {
        return next(e);
    }
});

router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobSchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const job = await Job.create(req.body);

        return res.status(201).json({ job });
    } catch (e) {
        return next(e);
    }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const job = await Job.getOne(req.params.id);

        return res.status(200).json({ job });
    } catch (e) {
        return next(e);
    }
});

router.patch('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobSchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const job = await Job.update(req.params.id, req.body);
        return res.status(200).json({ job });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const result = await Job.remove(req.params.id);

        return res.status(200).json(result);
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
