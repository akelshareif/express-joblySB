const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

/** Class containing CRUD methods for jobs table */

class Job {
    static async getAll({ search = null, min_salary = 0, min_equity = 0 }) {
        /**
         * Given req.query as parameter
         * - If search is provided, returns jobs with titles matching given search pattern
         * - If min_salary and/or min_equity are provided, returns jobs with the specified minimums
         * Returns array of jobs
         */

        if (search) {
            const searchResults = await db.query(
                `SELECT * FROM jobs
                 WHERE title ILIKE '%' || $1 || '%'
                 AND
                 salary >= $2
                 AND
                 equity >= $3
                 ORDER BY id`,
                [search, min_salary, min_equity]
            );

            if (searchResults.rows.length === 0) {
                throw new ExpressError(
                    `Error: No jobs found with given parameters - Search Pattern: ${search}, Minimum Salary: ${min_salary}, Minimum Equity: ${min_equity}.`,
                    404
                );
            }

            return searchResults.rows;
        } else {
            const allResults = await db.query(
                `SELECT * FROM jobs
                 ORDER BY id`
            );

            if (allResults.rows.length === 0) {
                throw new ExpressError(`Error: No jobs found in database.`, 404);
            }

            return allResults.rows;
        }
    }

    static async create({ title, salary, equity, company_handle }) {
        /**
         * Given req.body as parameter
         * - Creates and saves a job to db with destructured data from req.body
         * - req.body data is validated via JSONSchema prior to method call
         * Returns object containing newly added job info
         */

        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title, salary, equity, company_handle]
        );

        if (result.rows.length === 0) {
            throw new ExpressError('Error: There was an error creating job entry. Please try again with correct data.', 400);
        }

        return result.rows[0];
    }

    static async getOne(id) {
        /**
         * Given job id as parameter
         * - Returns single job object
         */

        const result = await db.query(
            `SELECT * FROM jobs
             WHERE id=$1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No job found with given id of ${id}.`, 404);
        }

        return result.rows[0];
    }

    static async update(id, data) {
        /**
         * Given job id and update data as query parameters
         * - Returns job with newly updated data
         * - partialUpdate() allows for partial update of db job record.
         */

        const { query, values } = partialUpdate('jobs', data, 'id', id);

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No job found/updated with given id of ${id}.`, 404);
        }

        return result.rows[0];
    }

    static async remove(id) {
        /**
         * Given job id as query parameter
         * - Returns obj with delete message
         */

        const result = await db.query(
            `DELETE FROM jobs
             WHERE id=$1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No job found/deleted with given id of ${id}.`, 404);
        }

        return {
            message: `Job with id of ${id} was deleted.`,
        };
    }
}

module.exports = Job;
