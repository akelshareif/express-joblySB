process.env.NODE_ENV === 'test';

const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let testCompany1, testCompany2;

beforeEach(async () => {
    testCompany1 = {
        handle: 'goog',
        name: 'Google',
        num_employees: 5000,
        description: 'The google search engine',
        logo_url: 'www.google.com',
    };

    testCompany2 = {
        handle: 'appl',
        name: 'Apple',
        num_employees: 2000,
        description: 'Creator of MacOS',
        logo_url: 'www.apple.com',
    };

    await db.query(
        `INSERT INTO companies
         VALUES ('goog', 'Google', 5000, 'The google search engine', 'www.google.com'),
                ('appl', 'Apple', 2000, 'Creator of MacOS', 'www.apple.com')`
    );
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /companies', () => {
    test('Return obj with list of all companies', async () => {
        const res = await request(app).get('/companies');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            companies: expect.any(Array),
        });
        expect(res.body).toEqual({
            companies: expect.arrayContaining([
                expect.objectContaining({ handle: testCompany1.handle }),
                expect.objectContaining({ handle: testCompany2.handle }),
            ]),
        });
    });

    test('testing search query string', async () => {
        const res = await request(app).get('/companies?search=ap');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            companies: expect.any(Array),
        });
        expect(res.body).toEqual({
            companies: expect.arrayContaining([expect.objectContaining({ handle: testCompany2.handle })]),
        });
    });

    test('testing min_emp and max_emp query strings', async () => {
        const res = await request(app).get('/companies?min_emps=200&max_emps=3000');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            companies: expect.any(Array),
        });
        expect(res.body).toEqual({
            companies: expect.arrayContaining([expect.objectContaining({ handle: testCompany2.handle })]),
        });
    });
});

describe('POST /companies', () => {
    test('Creating a company', async () => {
        const res = await request(app).post('/companies').send({
            handle: 'ibm',
            name: 'IBM',
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            company: expect.any(Object),
        });
        expect(res.body).toEqual({
            company: expect.objectContaining({
                handle: 'ibm',
                name: 'IBM',
            }),
        });
    });

    test('Throw 400 status with error stack when JSONSchema is violated', async () => {
        const res = await request(app).post('/companies').send({
            name: 'IBM',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            status: 400,
            message: expect.any(Array),
        });
    });
});

describe('GET /companies/:handle', () => {
    test('Get a single company', async () => {
        const res = await request(app).get(`/companies/${testCompany1.handle}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            company: expect.any(Object),
        });
        expect(res.body).toEqual({
            company: testCompany1,
        });
    });

    test('Throw 404 error when company doesnt exist', async () => {
        const res = await request(app).get('/companies/abc');

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({
            status: 404,
            message: 'Error: No company found with given handle of abc.',
        });
    });
});

describe('PATCH /companies/:handle', () => {
    test('Update a single company', async () => {
        const res = await request(app).patch(`/companies/${testCompany2.handle}`).send({
            handle: testCompany2.handle,
            name: testCompany2.name,
            num_employees: 15000,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            company: expect.any(Object),
        });
        expect(res.body).toEqual({
            company: expect.objectContaining({
                handle: testCompany2.handle,
                num_employees: 15000,
            }),
        });
    });

    test('Throw 400 error if JSONSchema is violated', async () => {
        const res = await request(app).patch(`/companies/${testCompany2.handle}`).send({
            handle: testCompany2.handle,
            num_employees: 15000,
        });

        expect(res.statusCode).toEqual(400);

        const res2 = await request(app).patch(`/companies/${testCompany2.handle}`).send({
            garbage: 3324,
        });

        expect(res2.statusCode).toEqual(400);
    });
});

describe('DELETE /companies/:handle', () => {
    test('Deletes a company and returns message', async () => {
        const res = await request(app).delete(`/companies/${testCompany2.handle}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            message: `Company ${testCompany2.handle} was deleted`,
        });
    });

    test('Throw 404 error when given company that does not exist', async () => {
        const res = await request(app).delete('/companies/garbage');

        expect(res.statusCode).toEqual(404);
    });
});
