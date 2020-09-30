process.env.NODE_ENV === 'test';

const db = require('../../db');
const partialUpdate = require('../../helpers/partialUpdate');

let updateData = {
    num_employees: 15000,
};

describe('partialUpdate()', () => {
    it('should generate a proper partial update query with just 1 field', async () => {
        const sql = partialUpdate('companies', updateData, 'handle', 'goog');
        const { query, values } = sql;
        const res = await db.query(query, values);

        expect(res.rows[0]).toEqual(expect.objectContaining(updateData));
    });
});

afterAll(async () => {
    await db.end();
});
