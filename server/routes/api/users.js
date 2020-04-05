const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var config = require('config');
const {check, validationResult} = require('express-validator/check');

//Model
const Users = require('../../models/Users');



//@route    POST api/users
//@desc    register user
//@Access   Public 

router.post('/', [
    check('name', 'Name is required').not().notEmpty(),
    check('email','Enter valid email').isEmail(),
    check('password',' Enter valid password with min lenth 6').isLength({min: 6})
],
async (req, res)=> {
    console.log(req.body)
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} =req.body;

    try {
        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({errors : [{ msg: "User exists"}]})
        }

        const avatar = gravatar.url(email,{
            s:'200',
            p:'pg',
            d:'mm'
        })

        user= new Users({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);
        user.password =await bcrypt.hash(password, salt);
        await user.save();

        const payload= {
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtsecret'),
            { expiresIn: 360000}, 
            (err, token)=>{
                if(err) throw err;
                console.log(token)
                res.json({token});
            })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
});

module.exports= router;

/*  
CREATE USER 

curl -d '{"name":"nikil", "email":"nikil@gmail.com", "password":"abcd12", "avatar": "https://abc.com", "date": "1585907429099"}' \
-H "Content-Type: application/json" -X POST "http://localhost:5000/api/users"

*/

/*

email: 'nithin@gmail.com',
  password: '123456',
*/