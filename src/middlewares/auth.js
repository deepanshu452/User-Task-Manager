const jwt = require('jsonwebtoken');
const User = require('../models/users');


const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        // console.log("token is: ", token)
        const decode = jwt.verify(token,'MySecret')
        // console.log("decoded is: ", decode)
        const user = await User.findOne({_id:decode._id,'tokens.token':token})
        // console.log(user)
        if(!user) 
            throw new Error()

        req.token = token;
        req.user = user;
        next()
    } catch(e){
        res.status(401).send("error: Please Authenticate..")
    }
}

module.exports = auth