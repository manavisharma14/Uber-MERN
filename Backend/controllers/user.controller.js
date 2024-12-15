const { hash } = require('bcrypt');
const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.registerUser = async (req, res, next) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, fullname: { firstname, lastname } } = req.body;


        // Hash the password
        const hashedPassword = await userModel.hashPassword(password);

        // Create a new user
        
const user = await userService.createUser({
    fullname: { firstname, lastname },
    email,
    password: hashedPassword,
});

        // Generate JWT token
        const token = user.generateAuthToken();

        // Send response
        res.status(201).json({ token, user });
    } catch (error) {
        // Error handling
        console.error('Error during user registration:', error);
        res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
    }
};


module.exports.loginUser = async(req, res, next) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;

        const user = await userModel.findOne({email}).select('+password');

        if(!user){
            return res.status(401).json({message : 'Invalid email or password'});
        }
        
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const token = user.generateAuthToken();

        res.cookie('token', token);

        res.status(200).json({token, user});
}

module.exports.getUserProfile = async(req, res, next) => {
    res.status(200).json(req.user);
}

module.exports.logoutUser = async(req, res, next) => {
    res.clearCookie('token');

    const token  = req.cookies.token || req.headers.authorizaion.split(' ')[1];
    await blacklistTokenModel.create({ token });

    res.status(200).json({message : 'Logged out'});

}