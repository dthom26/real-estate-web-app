import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import request from 'supertest';

// Load cms-backend .env.development.local explicitly so connectDB sees DB_URI
const envPath = path.resolve(process.cwd(), 'cms-backend', '.env.development.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // strip optional surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

import app from '../app.js';
import connectDB from '../database/mongodb.js';
import User from '../models/user.js';
import RefreshToken from '../models/refreshToken.js';

function fail(msg) {
  console.error('TEST FAILED:', msg);
// will dynamic-import app/connectDB/models after env is loaded
const [{ default: app }, { default: connectDB }, { default: User }, { default: RefreshToken }] = await Promise.all([
  import('../app.js'),
  import('../database/mongodb.js'),
  import('../models/user.js'),
  import('../models/refreshToken.js'),
]);
  // Connect to the configured DB (from .env)
  await connectDB();

  await connectDB();
  await User.deleteMany({ username: 'admin' });
  await RefreshToken.deleteMany({});
  await User.create({ username: 'admin', password: 'YourSecurePassword123!' });

  const agent = request.agent(app);

  // CSRF bootstrap
  const csrfRes = await agent.get('/api/auth/csrf');
  if (csrfRes.status !== 200) fail('CSRF bootstrap failed');
  const csrfToken = csrfRes.body?.data?.csrfToken;

  // Login
  const loginRes = await agent.post('/api/auth/login').set('X-CSRF-Token', csrfToken).send({ username: 'admin', password: 'YourSecurePassword123!' });
  if (loginRes.status !== 200) fail('Login failed');
  const accessToken1 = loginRes.body?.data?.accessToken;
  if (!accessToken1) fail('No access token on login');

  // ensure refresh token persisted
  let tokens = await RefreshToken.find({});
  if (tokens.length !== 1) fail('Expected 1 refresh token after login');
  const firstJti = tokens[0].jti;

  // Refresh (rotate)
  const csrf2 = (await agent.get('/api/auth/csrf')).body.data.csrfToken;
  const refreshRes = await agent.post('/api/auth/refresh').set('X-CSRF-Token', csrf2).send();
  if (refreshRes.status !== 200) fail('Refresh failed');
  const accessToken2 = refreshRes.body?.data?.accessToken;
  if (!accessToken2 || accessToken2 === accessToken1) fail('Refresh did not rotate access token');

  const all = await RefreshToken.find({}).lean();
  if (all.length !== 2) fail('Expected 2 refresh tokens after rotation');
  const old = all.find(t => t.jti === firstJti);
  if (!old || !old.revoked) fail('Old refresh token not revoked');

  // Logout
  const csrf3 = (await agent.get('/api/auth/csrf')).body.data.csrfToken;
  const logoutRes = await agent.post('/api/auth/logout').set('X-CSRF-Token', csrf3).send();
  if (logoutRes.status !== 200) fail('Logout failed');

  const remaining = await RefreshToken.find({ user: all[0].user }).lean();
  if (!remaining.every(t => t.revoked)) fail('Not all tokens revoked after logout');

  console.log('Integration auth test passed');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
