import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';
import connectDB from '../database/mongodb.js';
import User from '../models/user.js';
import RefreshToken from '../models/refreshToken.js';

let mongoServer;
let agent;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.DB_URI = mongoServer.getUri();
  await connectDB();
  // create admin user
  await User.create({ username: 'admin', password: 'YourSecurePassword123!' });
  agent = request.agent(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await RefreshToken.deleteMany({});
});

test('login -> refresh -> logout flow with rotation and revocation', async () => {
  // 1: get CSRF
  const csrfRes = await agent.get('/api/auth/csrf');
  expect(csrfRes.status).toBe(200);
  const csrfToken = csrfRes.body?.data?.csrfToken;
  expect(csrfToken).toBeDefined();

  // 2: login
  const loginRes = await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ username: 'admin', password: 'YourSecurePassword123!' });
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.success).toBe(true);
  const accessToken1 = loginRes.body.data?.accessToken;
  expect(accessToken1).toBeDefined();

  // ensure one refresh token stored
  let tokens = await RefreshToken.find({});
  expect(tokens.length).toBe(1);
  const firstJti = tokens[0].jti;
  expect(firstJti).toBeDefined();

  // 3: call refresh to rotate
  // note: agent preserves cookies, but server rotates csrf token; re-read cookie value by calling csrf endpoint again
  const csrf2 = (await agent.get('/api/auth/csrf')).body.data.csrfToken;
  const refreshRes = await agent.post('/api/auth/refresh').set('X-CSRF-Token', csrf2).send();
  expect(refreshRes.status).toBe(200);
  expect(refreshRes.body.success).toBe(true);
  const accessToken2 = refreshRes.body.data?.accessToken;
  expect(accessToken2).toBeDefined();
  expect(accessToken2).not.toBe(accessToken1);

  // ensure old JTI revoked and new token stored
  const all = await RefreshToken.find({}).lean();
  expect(all.length).toBe(2);
  const old = all.find(t => t.jti === firstJti);
  expect(old.revoked).toBe(true);

  // 4: logout - need latest csrf
  const csrf3 = (await agent.get('/api/auth/csrf')).body.data.csrfToken;
  const logoutRes = await agent.post('/api/auth/logout').set('X-CSRF-Token', csrf3).send();
  expect(logoutRes.status).toBe(200);
  expect(logoutRes.body.success).toBe(true);

  // all refresh tokens for user should be revoked
  const remaining = await RefreshToken.find({ user: all[0].user }).lean();
  expect(remaining.every(t => t.revoked)).toBe(true);
});
