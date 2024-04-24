const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
// const user = require('../../db/models/user');

const validateSignup = [
    check('firstName')
        .exists({ checkFalsy: true })
        .isLength({ min: 2 })
        .not()
        .withMessage("First Name is required"),
    check('lastName')
        .exists({ checkFalsy: true })
        .isLength({ min: 2 })
        .not()
        .withMessage("Last Name is required"),
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Invalid Email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Username is required.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
];


const validateEmail = async (req,res,next) =>{

    const{email} = req.body

    const existingEmail = await User.findOne(
        { 
        where:{email: email}, 
        },
    );
    if (existingEmail) {
        console.log("line47",existingEmail)
        res.status(500).json({
            message: "User already exists",
            errors: {
            username: "User with that email already exists",
            },
        });
    return;
    }
    next()
}
const validateUsername = async (req,res,next) =>{

    const{username} = req.body

    const existingUsername = await User.findOne({ 
        where:{username: username} 
    });

    if (existingUsername) {
        res.status(500).json({
            message: "User already exists",
            errors: {
            username: "User with that username already exists",
            },
        });
    return;
    }
    next()
    
}



router.post('/',validateSignup,validateEmail,validateUsername,handleValidationErrors,async (req, res) => {


try {

    const { email, password, username,firstName,lastName } = req.body;
    const hashedPassword = bcrypt.hashSync(password);

    const user = await User.create({ email, username, hashedPassword,firstName,lastName });

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName

    };    

    await setTokenCookie(res, safeUser);

    return res.json({

        user: safeUser
    });

    } catch (error) {
    }
}
);

module.exports = router;


