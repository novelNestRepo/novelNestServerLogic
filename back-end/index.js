const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


const app = express();
dotenv.config();

// middleware 
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))



const PORT = process.env.PORT || 4000
//running the server
app.listen(PORT, () => {
    console.log(`app is listening on port ${PORT}`)
})
