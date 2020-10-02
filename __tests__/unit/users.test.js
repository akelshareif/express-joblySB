process.env.NODE_ENV === 'test';

const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const User = require('../../models/userModel');

let testUser;

beforeEach(async () => {
    testUser = {
        username: 'test',
        password: 'password123',
        first_name: 'Bob',
        last_name: 'Doe',
        email: 'bob123@email.com',
    };

    await User.create(testUser);
});

afterEach(async () => {
    await db.query(`DELETE from users`);
});

afterAll(async () => {
    await db.end();
});

describe('GET /users', () => {
    test('Returns obj with list of all users', async () => {
        const res = await request(app).get('/users');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            users: expect.any(Array),
        });
        expect(res.body).toEqual({
            users: expect.arrayContaining([expect.objectContaining({ username: testUser.username })]),
        });
    });
});

describe('POST /users', () => {
    test('Create a new user', async () => {
        const res = await request(app).post('/users').send({
            username: 'limitless99',
            password: 'hfgnchnfgbchfgc',
            first_name: 'Bob',
            last_name: 'Doe',
            email: 'bobby99@email.com',
        });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            user: expect.any(Object),
        });
        expect(res.body).toEqual({
            user: expect.objectContaining({ username: 'limitless99' }),
        });
    });

    test('Throw 400 status with error stack when JSONSchema is violated', async () => {
        const res = await request(app).post('/users').send({
            garbage: 'lalalalalala',
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({
            status: 400,
            message: expect.any(Array),
        });
    });
});

describe('GET /users/:username', () => {
    test('Returns a single user', async () => {
        const res = await request(app).get(`/users/${testUser.username}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            user: expect.any(Object),
        });
        expect(res.body).toEqual({
            user: expect.objectContaining({ username: testUser.username }),
        });
    });

    test('Throw 404 error if user not found', async () => {
        const res = await request(app).get('/users/234234523');

        expect(res.statusCode).toEqual(404);
    });
});

describe('PATCH /users/:username', () => {
    test('Returns newly updated user', async () => {
        const res = await request(app).patch(`/users/${testUser.username}`).send({
            username: 'test',
            password: 'password123',
            first_name: 'Andrew',
            last_name: 'Doe',
            email: 'bob123@email.com',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            user: expect.any(Object),
        });
        expect(res.body).toEqual({
            user: expect.objectContaining({ first_name: 'Andrew' }),
        });
    });
});

describe('DELETE /users/:username', () => {
    test('Returns deletion message when user is deleted', async () => {
        const res = await request(app).delete(`/users/${testUser.username}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            message: `User with username of ${testUser.username} was deleted.`,
        });
    });
});
