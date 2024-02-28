const jwt = require('jsonwebtoken');
const User = require('../model/user.model');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'User are not logged in' });
    }

    try {
       
        const decoded = jwt.verify(token, 'WHAT-WAS'); 
    
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user || !user.verified) {
            return res.status(403).json({ message: 'Unauthorized. Please verify your email.' });
        }
    
        req.user = decoded.user;


        next(); 
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


module.exports = authenticate