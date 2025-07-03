const request = require('supertest');
const express = require('express');
const userRouter = require('../routes/user.routes');

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'user1', user_metadata: { role: 'user' } };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

describe('User Routes', () => {
  it('POST /api/user/request-password-reset should require email', async () => {
    const res = await request(app).post('/api/user/request-password-reset').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Email is required/);
  });
  it('POST /api/user/resend-email-verification should require email', async () => {
    const res = await request(app).post('/api/user/resend-email-verification').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Email is required/);
  });
});
