const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

/** Class containing CRUD methods for companies table */

class Company {
    static async getAll({ search = null, min_emps = 0, max_emps = Infinity }) {
        /**
         * Given req.query as parameter
         * - If search is provided, returns companies with given pattern
         * - If min_emps and/or max_emps are provided, returns companies with given range
         * - If min_emps > max_emps, throws 400 error with message
         * - If no parameters are provided, return all companies
         * Returns array of companies matching query-string parameters
         */

        if (min_emps > max_emps) {
            throw new ExpressError('Error: Maximum employees must be greater than or equal to than minimum employees.', 400);
        }

        if (search) {
            const searchResults = await db.query(
                `SELECT * FROM companies
                 WHERE name ILIKE '%' || $1 || '%'
                 AND
                 num_employees BETWEEN $2 AND $3
                 ORDER BY handle`,
                [search, min_emps, max_emps]
            );

            return searchResults.rows;
        } else {
            const allResults = await db.query(
                `SELECT * FROM companies
                 WHERE num_employees BETWEEN $1 AND $2
                 ORDER BY handle`,
                [min_emps, max_emps]
            );

            return allResults.rows;
        }
    }

    static async create({ handle, name, num_employees, description, logo_url }) {
        /**
         * Given req.body as parameter
         * - Creates and saves a company to db with data destructured from req.body
         * - Data from req.body is validated via JSONSchema prior to this fxn call
         * - Returns object containing given company data
         */

        const result = await db.query(
            `INSERT INTO companies (
                handle, 
                name, 
                num_employees, 
                description, 
                logo_url)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [handle, name, num_employees, description, logo_url]
        );

        return result.rows[0];
    }

    static async getOne(handle) {
        /**
         * Given company handle as query parameter
         * - Returns single company object
         */

        const result = await db.query(
            `SELECT * FROM companies
             WHERE handle=$1`,
            [handle]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No company found with given handle of ${handle}.`, 404);
        }

        return result.rows[0];
    }

    static async update(handle, data) {
        /**
         * Given company handle and update data as query parameters
         * - Returns company with newly updated data
         */

        const { query, values } = partialUpdate('companies', data, 'handle', handle);

        const result = db.query(query, values);

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No company found/updated with given handle of ${handle}.`, 404);
        }

        return result.rows[0];
    }

    static async remove(handle) {
        /**
         * Given company handle as query parameter
         * - Returns obj with delete message
         */

        const result = await db.query(
            `DELETE FROM companies
             WHERE handle=$1
             RETURNING *`,
            [handle]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Error: No company found/deleted with given handle of ${handle}.`, 404);
        }

        return {
            message: `Company ${handle} was deleted`,
        };
    }
}

module.exports = Company;
