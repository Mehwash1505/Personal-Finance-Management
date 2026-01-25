// File: backend/__tests__/userRoutes.test.js
const request = require('supertest'); 
// We will need to export our app from server.js for testing
const { app, server } = require('../server'); // We'll modify server.js for this
const mongoose = require('mongoose');
const User = require('../models/User');  

// Close the server and DB connection after all tests
afterAll(async () => {
  await server.close();
  await mongoose.connection.close(); 
});

describe('User API', () => {
  // Clear the users collection before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user with an existing email', async () => {
    // First, create a user
    await request(app).post('/api/users/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    // Then, try to create the same user again
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password456',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });
});

//final edited file
