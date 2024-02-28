const bcrypt = require('bcrypt');
const User = require('../model/user.model');
const Recipe = require('../model/recipe.model');
const Token = require('../model/token.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendemail = require('../util/email/sendEmail');
const validator = require('validator');
let resetToken="";


/**
 * Registration
 * @param {*} req 
 * @param {*} res 
 */
function register(req,res){
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({ error: 'Please enter valid email' });
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!regex.test(password)){
        return res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.' });  
    }

    bcrypt.hash(password, 10)
        .then((hashPassword) => {
            const user = new User({
                email: email,
                password: hashPassword,
            });

            
             const token = CreateToken(user);
             const expirationDate = new Date();
             expirationDate.setDate(expirationDate.getDate() + 1);      
             res.cookie('token', token, { httpOnly: true , expires: expirationDate });    
             user.verificationToken = generateToken();
             user.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
             user.save()
                .then((result) => {
                    sendemail(
                        email,
                        "Welcome",
                        {
                            name: "Hello " + email,
                        },
                        "./template/welcome.handlebars"
                    );

                    const link = `localhost:3000/verify-email?email=${email}&token=${user.verificationToken}`;
                    sendemail(
                        email,
                        "Verify Email",
                        {
                            name: "Hello",
                            link: link,
                        },
                        "./template/verifyEmail.handlebars"
                    );

                    res.status(401).send({
                        message: "Registration successful! Please check your email to verify.",
                        result,
                        token,
                        link,
                    })

                    
                })
                .catch((error) => {
                    res.status(500).send({
                        message: "Email id already exist",
                    });
                });    
        })
        .catch((e) => {
            res.status(500).send({
                message: "Password was not hashed successfully",
            });
        });

}

/**
 * Verify Email Address 
 * @param {*} req 
 * @param {*} res 
 *  
 */
async function verfiyEmail(req,res){
    const { email, token } = req.query;

    const user = await User.findOne({email});
    if(!user){
        res.status(400).send("Invalid token or email");
    }

    if(user.verified){
        res.status(200).send("Email Already Verified");
    }

    
    if (Date.now() > user.verificationTokenExpires) {
        return res.status(400).send('Verification token expired. Please request a new one.');
    }

    const checktoken = await User.findOne({verificationToken:token});
    if(!checktoken){
        res.status(400).send("Invalid or expired token");
    }
    else{
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        res.status(200).send("Email Verified Successfully");
    }
     
    
}

/**
 * Login
 * @param {*} req 
 * @param {*} res 
 */
function login(req, res){
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    User.findOne({ email: email })
        .then((user) => {        
            bcrypt.compare(password, user.password)
                .then((passwordcheck) => {
                    if (!passwordcheck) {
                        return res.status(400).send({
                            message: "Passwords does not match",
                            error,
                        });
                    }
                    const token = CreateToken(user);
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 1);
                    res.cookie('token', token, { httpOnly: true, expires: expirationDate });    
                    res.status(200).send({
                        message: "Login Successful",
                        email: user.email,
                        userId:user._id,
                        token:token,
                    });

                   

                })
                .catch((error) => {
                    res.status(400).send({
                        message: "Password doesn't match",
                        error,
                    });
                });
        })
        .catch((e) => {
            res.status(404).send({
                message: "Email not found",
                e,
            });
        });
}

/**
 * Forget Password Request
 * @param {*} req 
 * @param {*} res 
 */
async function forgetPassword(req, res){
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const checkemail = await User.findOne({ email });
        if (!checkemail){
            return res.status(400).json({ error: 'Email is not exist please use another email' });  
        } 

        const token = generateToken();

        await User.findOneAndUpdate({ email }, {
            resetToken: token,
            resetTokenExpiration: Date.now() + 3600000 
        });

        const link = `http://localhost:3000/reset-password/${token}\n\n`;

        sendemail(
            email,
            "forget password",
            {
                name: "Hello",
                link: link,
            },
            "./template/requestResetPassword.handlebars"
        );
        

        return res.status(200).send({
            message: "reset-password link sent to your email",
            token:token
        });

    }
    catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

/**
 * Set Password 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function setPasswordAfterForgetPassword(req,res){
    const password = req.body.password;
    const token = req.body.token;

    const user = await User.findOne(
        {
            resetToken: token,
            resetTokenExpiration: {
                $gt: Date.now()
            }
        });

    if (!user) {
        return res.status(400).json({ 
            message: 'Invalid or expired token' 
        });
    }


    bcrypt.hash(password, 10)
        .then((hashPassword) => {
            user.password = hashPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;

            user.save();
            res.status(200).json({
                message: "password changed successfully",
            });
         
        })
        .catch((e) => {
            res.status(500).send({
                message: "Password was not hashed successfully",
            });
        });
        

}

/**
 * Logout 
 * @param {*} req 
 * @param {*} res 
 */
function logout (req,res){
    res.clearCookie('token').send('Logged out successfully');
}


/**
 * Generate Token 
 * @returns String
 */
const generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
};


/**
 * Reset Password Request
 * @param {*} req 
 * @param {*} res 
 * 
 */
async function requestPasswordReset(req, res) {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email is not exist' });
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(10));

    await new Token({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
    }).save();

    const link = `localhost:3000/passwordReset?token=${resetToken}&id=${user._id}`;

    sendemail(
        user.email,
        "Password Reset Request",
        {
            name: "Hello",
            link: link,
        },
        "./template/requestResetPassword.handlebars"
    );
   // return { link };

   return res.status(200).send({
    message: link
   });

}


/**
 * Reset Password 
 * @param {*} req 
 * @param {*} res 
 *
 */
async function resetPassword(req,res){

    const currentUserId = getCurrentUserId(req);
    const userId = currentUserId;
    const token = resetToken;
    const password = req.body.password;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    let passwordToken = await Token.findOne({userId});

    if(!passwordToken) {
        return res.status(400).send({
            message: "Invalid or expired password token"
           });
    
    }

    const valid = await bcrypt.compare(token, passwordToken.token);

    if(!valid){
       return res.status(400).send({
        message: "Expired password reset token"
       });
       
    }

    const hash = await bcrypt.hash(password , Number(10));

    await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    );

    const user = await User.findById({_id: userId});
    sendemail(
        user.email,
        "Password Reset Successfully",
        {
          name: "hii",
        },
        "./template/resetPassword.handlebars"
      );
    
      await passwordToken.deleteOne();
    

      return res.status(200).send({
        message: "Password reset was successful"
       });

}


/**
 * Delete Account
 * @param {*} req 
 * @param {*} res 
 * 
 */
async function deleteUserAccount(req,res){
     const id = getCurrentUserId(req);
     const userId = id;
     const user = await User.findOne({_id:userId});
     if(user){
        await Recipe.deleteMany({userId:userId});
        await user.deleteOne();
        res.clearCookie('token');
        return res.status(200).send({
            message: "Deleted User Successfully",
        })
     }
     else{
        return res.status(401).send({
            message: "something error occured",
        })
     }

}

/**
 * Create JWT Token 
 * @param {*} user 
 * @returns String
 */
function CreateToken(user){
    const token = jwt.sign(
        {
            userId: user._id,
            userEmail: user.email,
        },
        "WHAT-WAS",
        {
            expiresIn: "90h"
        }
    );

   return token; 
}

/**
 *  fetch current user id
 * @param {token} req 
 * @returns Object
 */
function getCurrentUserId(req){
    const token = req.cookies.token;
    if(!token){
       return null;
    }
    try {
     const decoded = jwt.verify(token, 'WHAT-WAS'); 
     const userId = decoded.userId;

     return userId;
 } catch (error) {
     console.error('Error decoding token:', error);
     return null;
 }
}

module.exports = {
    register,
    login,
    forgetPassword,
    setPasswordAfterForgetPassword,
    requestPasswordReset,
    resetPassword,
    deleteUserAccount,
    logout,
    verfiyEmail,
}



