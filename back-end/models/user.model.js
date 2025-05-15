const supabase = require("./../config/supabase");

class UserModel  {
    static async createUser(email, password) { 
        return await supabase.auth.signUp({email, password})
     }

     static async loginUser(email, password) {
        return await supabase.auth.signInWithPassword({email, password});
     }
}

module.exports = UserModel;