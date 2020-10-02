// Authenticates user via JWT token and stores authenticated user to the request object

const jwt = require('jsonwebtoken');
const ExpressError = require('../helpers/expressError');
const { SECRET_KEY } = require('../config');

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
    try {
        // retrieve JWT from req.body and verify signature, returning payload
        const token = req.body._token;
        const payload = jwt.verify(token, SECRET_KEY);

        // store current user payload in request object
        req.user = payload;

        return next();
    } catch (err) {
        return next();
    }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
    // If no user is found within request object, return unauthorized error
    if (!req.user) {
        return next({ status: 401, message: 'Error: Unauthorized' });
    } else {
        return next();
    }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
    try {
        /**
         *  If the user within request object is the same as user within url parameters
         *  - continue to next middleware/route
         *  - else, throw unauthorized error
         */
        if (req.user.username === req.params.username) {
            return next();
        } else {
            return next({ status: 401, message: 'Error: Unauthorized' });
        }
    } catch (err) {
        // errors would happen here if we made a request and req.user is undefined
        return next({ status: 401, message: 'Error: Unauthorized' });
    }
}

/** Middleware: Requires user is an admin */

function ensureAdmin(req, res, next) {
    if (!req.user || req.user.is_admin != true) {
        const err = new ExpressError('Error: Unauthorized', 401);
        return next(err);
    } else {
        return next();
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser,
    ensureAdmin,
};
