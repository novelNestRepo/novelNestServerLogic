const UserModel = require("./../models/user.model");


exports.register = async (req,res) => {
    try {
        const {email, password} = req.body;
        const {data, error} = await UserModel.createUser(email, password);
        if (error) {
            res.json({user: data.user})
        }
    }catch(er) {
        console.log(er.message ? er.message: er);
    }
}

exports.login = async (req,res) => {
    try {
        const {email, password} = req.body;
        const {data, error} = await UserModel.loginUser(email, password)
        if (error) return res.status(401).json({error: error.message || error}))
    } catch(er) {
        console.log(er.message || er)
    }
}