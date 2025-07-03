const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Mock Supabase
jest.mock("../config/supabase", () => ({
  auth: {
    getUser: jest.fn(),
  },
}));
const supabase = require("../config/supabase");

describe("authenticateToken", () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 401 if no token provided", async () => {
    await authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
  });

  it("should return 403 if token is invalid", async () => {
    req.headers["authorization"] = "Bearer invalidtoken";
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: "Invalid token",
    });
    await authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it("should call next and attach user if token is valid", async () => {
    req.headers["authorization"] = "Bearer validtoken";
    const user = { id: "123", user_metadata: { role: "user" } };
    supabase.auth.getUser.mockResolvedValue({ data: { user }, error: null });
    await authenticateToken(req, res, next);
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { user_metadata: {} } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should return 403 if user is not admin", () => {
    req.user.user_metadata.role = "user";
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
  });

  it("should call next if user is admin", () => {
    req.user.user_metadata.role = "admin";
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
