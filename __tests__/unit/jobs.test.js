process.env.NODE_ENV === 'test';

const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

let google, job;

beforeEach(async () => {
    google = {
        handle: 'goog',
        name: 'Google',
        num_employees: 5000,
        description: 'The google search engine',
        logo_url: 'www.google.com',
    };

    job = {
        title: 'Full-Stack Engineer',
        salary: 125000,
        equity: 0.001,
        company_handle: 'goog',
    };

    await db.query(
        `INSERT INTO companies
             VALUES ('goog', 'Google', 5000, 'The google search engine', 'www.google.com'),
                    ('appl', 'Apple', 2000, 'Creator of MacOS', 'www.apple.com')`
    );

    await db.query(
        `INSERT INTO jobs (
            title,
            salary,
            equity,
            company_handle)
         VALUES ($1, $2, $3, $4)`,
        [job.title, job.salary, job.equity, job.company_handle]
    );
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE from jobs`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /jobs', () => {
    test('Returns obj with list of all jobs', async () => {
        const res = await request(app).get('/jobs');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            jobs: expect.any(Array),
        });
        expect(res.body).toEqual({
            jobs: expect.arrayContaining([expect.objectContaining(job)]),
        });
    });

    test('Testing search query string', async () => {
        const res = await request(app).get('/jobs?search=stack');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            jobs: expect.arrayContaining([expect.objectContaining(job)]),
        });
    });

    test('Testing min_salary and min_equity query strings', async () => {
        const res = await request(app).get('/jobs?min_salary=10000&min_equity=0.0001');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            jobs: expect.arrayContaining([expect.objectContaining(job)]),
        });
    });
});

describe('POST /jobs', () => {
    test('Create a new job', async () => {
        const res = await request(app).post('/jobs').send({
            title: 'Product Designer',
            salary: 99000,
            equity: 0.001,
            company_handle: 'goog',
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            job: expect.any(Object),
        });
        expect(res.body).toEqual({
            job: expect.objectContaining({ title: 'Product Designer' }),
        });
    });

    test('Throw 400 status with error stack when JSONSchema is violated', async () => {
        const res = await request(app).post('/jobs').send({
            title: 'SWE',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            status: 400,
            message: expect.any(Array),
        });
    });
});

describe('GET /jobs/:id', () => {
    test('Returns a single job', async () => {
        const jobRes = await db.query('SELECT * FROM jobs');
        const job = jobRes.rows[0];
        const res = await request(app).get(`/jobs/${job.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            job: expect.any(Object),
        });
        expect(res.body).toEqual({
            job: expect.objectContaining({ id: job.id, title: job.title }),
        });
    });

    test('Throw 404 error if job not found', async () => {
        const res = await request(app).get('/jobs/234234523');

        expect(res.statusCode).toEqual(404);
    });
});

describe('PATCH /jobs/:id', () => {
    test('Returns newly updated job', async () => {
        const jobRes = await db.query('SELECT * FROM jobs');
        const job = jobRes.rows[0];

        const res = await request(app).patch(`/jobs/${job.id}`).send({
            title: 'Full-Stack Engineer',
            salary: 145000,
            equity: 0.02,
            company_handle: 'goog',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            job: expect.any(Object),
        });
        expect(res.body).toEqual({
            job: expect.objectContaining({ salary: 145000, equity: 0.02 }),
        });
    });
});

describe('DELETE /jobs/:id', () => {
    test('Returns deletion message when job is deleted', async () => {
        const jobRes = await db.query('SELECT * FROM jobs');
        const job = jobRes.rows[0];
        const res = await request(app).delete(`/jobs/${job.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            message: `Job with id of ${job.id} was deleted.`,
        });
    });
});
