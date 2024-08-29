import { port } from "../../src/config";
import app from "../../src/app";
import * as request from 'supertest';
import { AppDataSource } from "../../src/data-source";


let connection, server;

const testUser = {
    firstName: "Claude",
    lastName: "VanDemme",
    age: 20,
};

beforeEach(async() => {
    connection = await AppDataSource.initialize();
    await connection.synchronize(true);
    server = app.listen(port);
});

afterEach(async() => {
    connection.close();
    server.close();
})

it('it should be no users initially', async () => {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    console.log(response.body);
});

it('it should create a user', async () => {
    const response = await request(app).post('/users').send(testUser);
    // expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...testUser, id: 1});
});

it('should not create a user if no firstname is given', async() => {
    const response = await request(app).post('/users').send({ lastName: 'Quin', age: 12});
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toEqual({
        "location": "body", "msg": "Invalid value", "path": "firstName", "type": "field"
        });
});

it('should not create user if age is less than 0', async() => {
    const response = await request(app).post('/users').send({ firstName: 'Brain', lastName: 'Okafar', age: -1 });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toEqual({
        msg: 'Must be a positive integer', value: -1, location: 'body', path: 'age', type: "field"
    });
});