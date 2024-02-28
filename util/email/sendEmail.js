const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { error } = require('console');
require('dotenv').config();

async function sendemail(email,subject,payload,template){
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'pratikprajapati8733@gmail.com',
                pass: process.env.EMAIL_PASS
            }
        });

        const source = fs.readFileSync(path.join(__dirname,template), "utf-8");
        const compiledTemplate = handlebars.compile(source);
        const options = () =>{
            return {
                from: 'pratikprajapati8733@gmail.com',
                to: email,
                subject: subject,
                html: compiledTemplate(payload),
            };
        };

        transporter.sendMail(options() , (error , info) => {
            if(error){
                return error;
            }else{
                return res.status(200).json({
                    success: true,
                });
            }
        });
        
    }
    catch(error){
        return error;
    }
};

module.exports = sendemail;