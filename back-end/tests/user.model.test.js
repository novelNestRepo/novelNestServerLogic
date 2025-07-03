const UserModel = require('../models/user.model');

jest.mock('../config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  },
}));
const supabase = require('../config/supabase');

describe('UserModel', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createUser', () => {
    it('should throw error for invalid email', async () => {
      const res = await UserModel.createUser('bademail', 'password123');
      expect(res.error.message).toMatch(/Invalid email format/);
    });
    it('should throw error for short password', async () => {
      const res = await UserModel.createUser('user@example.com', '123');
      expect(res.error.message).toMatch(/at least 6 characters/);
    });
    it('should return data for valid input', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: '1', email: 'user@example.com' } }, error: null });
      const res = await UserModel.createUser('user@example.com', 'password123');
      expect(res.data.user.email).toBe('user@example.com');
      expect(res.error).toBeNull();
    });
  });

  describe('loginUser', () => {
    it('should return error if login fails', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: { message: 'fail' } });
      const res = await UserModel.loginUser('user@example.com', 'badpass');
      expect(res.data).toBeNull();
      expect(res.error).toBeTruthy();
    });
    it('should return data if login succeeds', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
      const res = await UserModel.loginUser('user@example.com', 'password123');
      expect(res.data.user.id).toBe('1');
      expect(res.error).toBeNull();
    });
  });

  describe('requestPasswordReset', () => {
    it('should call supabase.auth.resetPasswordForEmail', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
      const res = await UserModel.requestPasswordReset('user@example.com');
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled();
      expect(res.error).toBeNull();
    });
  });

  describe('resendEmailVerification', () => {
    it('should call supabase.auth.signUp', async () => {
      supabase.auth.signUp.mockResolvedValue({ data: {}, error: null });
      const res = await UserModel.resendEmailVerification('user@example.com');
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(res.error).toBeNull();
    });
  });
});
