const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function(req, res, next){
    // get token from header 
    const token = req.header('x-auth-token');

    //check if no token 
    if(!token){
        return res.send(401).json({ msg :"No token, auth denied"})
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtsecret'));
        req.user =decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({msg: "Token invalid"})
    }
} 