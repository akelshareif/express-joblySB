// Login route which authenticates a user and creates JWT via middleware

const express = require('express');
const router = new express.Router();
// const {} = require('../middleware/auth')
const User = require('../models/userModel');

router.post('/login', async (req, res, next) => {
    try {
        const token = await User.authenticate(req.body);
        if (token) {
            return res.status(200).json({ token });
        }
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
