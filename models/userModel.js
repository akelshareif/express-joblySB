const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');

/** Class containing CRUD methods for users table */

class User {
    static async getAll() {
        // Returns an array of users

        const res = await db.query(
            `SELECT * FROM users
             ORDER BY username`
        );

        if (res.rows.length === 0) {
            throw new ExpressError(`Error: No users found in database.`, 404);
        }

        return res.rows;
    }

    static async create({ username, password, first_name, last_name, email, photo_url, is_admin }) {
        /**
         * Given req.body as parameter
         * - Creates a user with hashed password and saves to db
         * - Returns newly created user
         */
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const res = await db.query(
            `INSERT INTO users (
                username,
                password,
                first_name,
                last_name,
                email,
                photo_url,
                is_admin )
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING username`,
            [username, hashedPassword, first_name, last_name, email, photo_url, is_admin || false]
        );

        if (res.rows.length === 0) {
            throw new ExpressError(`Error: There was an error creating a new user. Please try again with correct data`, 400);
        }

        return res.rows[0];
    }

    static async getOne(username) {
        // Gets a single user

        const res = await db.query(
            `SELECT username, first_name, last_name, email, photo_url FROM users
             WHERE username=$1`,
            [username]
        );

        if (res.rows.length === 0) {
            throw new ExpressError(`Error: No user found with given username of ${username}.`, 404);
        }

        return res.rows[0];
    }

    static async update(username, data) {
        // Updates a single user with new data

        const { query, values } = partialUpdate('users', data, 'username', username);

        const res = await db.query(query, values);

        if (res.rows.length === 0) {
            throw new ExpressError(`Error: No user found/updated with given username of ${username}.`, 404);
        }

        return res.rows[0];
    }

    static async remove(username) {
        // Deletes a single user

        const res = await db.query(
            `DELETE FROM users
             WHERE username=$1
             RETURNING username`,
            [username]
        );

        if (res.rows.length === 0) {
            throw new ExpressError(`Error: No user found/deleted with given username of ${username}.`, 404);
        }

        return {
            message: `User with username of ${username} was deleted.`,
        };
    }
}

module.exports = User;
