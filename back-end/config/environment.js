require('dotenv').config();

module.exports = {
    PORT: process.env.PORT, 
    SUPABASE_URL: process.env.SUPABASE_URL , 
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,

}