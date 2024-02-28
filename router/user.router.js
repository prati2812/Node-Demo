const express = require('express');
const authenticate = require('../middleware/auth');
const {register,verfiyEmail , login , forgetPassword, setPasswordAfterForgetPassword , requestPasswordReset , resetPassword , deleteUserAccount, logout} = require('../controller/user.controller');


const userRouter = express.Router();


userRouter.post('/register' , register);
userRouter.post('/verify-email' , verfiyEmail);
userRouter.post('/login' , login);
userRouter.post('/forget-password' , authenticate , forgetPassword);
userRouter.post('/set-password' , setPasswordAfterForgetPassword);
userRouter.post('/request-password-reset' , authenticate , requestPasswordReset);
userRouter.post('/reset-password' , authenticate , resetPassword);
userRouter.post('/delete-user' , authenticate , deleteUserAccount);
userRouter.post('/logout', authenticate , logout);




module.exports = userRouter;