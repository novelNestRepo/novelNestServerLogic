const supabase = require("./../config/supabase");

class UserModel {
  static async createUser(email, password) {
    return await supabase.auth.signUp({ email, password });
  }

  static async loginUser(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  static async logoutUser() {
    return await supabase.auth.signOut();
  }

  static async getCurrentUser() {
    return await supabase.auth.getUser();
  }

  static async refreshSession() {
    return await supabase.auth.refreshSession();
  }
}

module.exports = UserModel;
