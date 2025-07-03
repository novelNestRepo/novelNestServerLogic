const request = require("supertest");
const express = require("express");
const channelsRouter = require("../routes/channels.routes");

jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "user1", user_metadata: { role: "user" } };
    next();
  },
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }),
}));

const app = express();
app.use(express.json());
app.use("/api/channels", channelsRouter);

describe("Channels Routes", () => {
  it("GET /api/channels should return 200", async () => {
    const res = await request(app).get("/api/channels");
    expect(res.status).toBe(200);
  });
  it("POST /api/channels should require name", async () => {
    const res = await request(app).post("/api/channels").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name is required/);
  });
});
