const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.authUser = async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        const token = req.cookies.token || 
                      (req.headers.authorization && req.headers.authorization?.split(' ')[1]);
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const isBlacklisted = await userModel.findOne({ token: token });

        if(isBlacklisted){
            return res.status(401).json({message : 'Unauthorized'});
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded._id) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Find the user in the database
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Unauthorized: Token verification failed' });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token: token });

    if(isBlacklisted){
        return res.status(401).json({message : 'Unauthorized'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        const captain = await captainModel.findById(decoded._id);
        req.captain = captain;
    }
    catch(error){
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
    }
}
