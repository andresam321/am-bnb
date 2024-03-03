const express = require('express')
const router = express.Router();
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');


const validateLogin = [
    check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Email or username is required"),
    check('password')
    .exists({ checkFalsy: true })
    .withMessage("Password is required"),
    handleValidationErrors
];

router.post('/',validateLogin,handleValidationErrors,async (req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
        where: {
        [Op.or]: {
            username: credential,
            email: credential,
        }
        }
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        // const err = new Error("Invalid credentials");
        // err.status = 400;
        // // err.title = 'Login failed';
        // err.errors = { 
        //     credential: "The provided credentials were invalid",
        //     password:   "Password is required"
        // };
        // return next(err);
        res.status(401)
        return res.json({
            message:"Invalid credentials"
        })
    }

    const safeUser = {
        id: user.id,
        firstName: user.firstName,
        username: user.username,
        email: user.email,
        lastName: user.lastName
    };

    await setTokenCookie(res, safeUser);

    return res.status(200).json({
        user: safeUser
    });
    }
    
);

router.delete('/',(_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
}
);

router.get('/',(req, res) => {
    const { user } = req;
    if (user) {
        const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        };
        return res.status(200).json({
        user: safeUser
        });
    } else return res.status(200).json({ user: null });
    }
);



module.exports = router;