const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');
const companySchema = require('../schemas/companySchema.json');
const Company = require('../models/companyModel');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const companies = await Company.getAll(req.query);
        return res.status(200).json({ companies });
    } catch (e) {
        return next(e);
    }
});

router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, companySchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const company = await Company.create(req.body);

        return res.status(201).json({ company });
    } catch (e) {
        return next(e);
    }
});

router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
    try {
        const company = await Company.getOne(req.params.handle);

        return res.status(200).json({ company });
    } catch (e) {
        return next(e);
    }
});

router.patch('/:handle', ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, companySchema);
        if (!result.valid) {
            return next({
                status: 400,
                message: result.errors.map((e) => e.stack),
            });
        }

        const company = await Company.update(req.params.handle, req.body);
        return res.status(200).json({ company });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:handle', ensureAdmin, async (req, res, next) => {
    try {
        const result = await Company.remove(req.params.handle);

        return res.status(200).json(result);
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
