const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');
const companySchema = require('../schemas/companySchema.json');
const Company = require('../models/companyModel');

router.get('/', async (req, res, next) => {
    try {
        const companies = await Company.getAll(req.query);
        return res.status(200).json(companies);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
