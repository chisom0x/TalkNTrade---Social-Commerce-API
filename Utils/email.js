const nodemailer = require('nodemailer')
const OTPModel = require('../Models/Authentication/otpModel')
const cron = require('node-cron')

async function generateOtp(userId) {
    const min = 1000;
    const max = 9999;

    const otpValue = Math.floor(min + Math.random() * (max - min + 1));

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
    
    try {
        const otpDocument = new OTPModel({
            user: userId,
            value: otpValue,
            expiresAt: expirationTime
        })

        try{
            await otpDocument.save();
        } catch (err) {
            console.log(err);
        }        

        return otpValue; 

    } catch (error) {
        console.error('Error saving OTP to MongoDB:', error);
        throw error;
      }
}

cron.schedule('* * * */24 * *', async () => {
    const now = new Date()
    await OTPModel.deleteMany({expiresAt: {$lt: now}})
})

class Email {
    constructor(email){
        this.to = email
    }

   newTransport() {
     return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "c48624b56f1808",
          pass: "253d8ceb5dedfc"
        }
     })
   }
   
   async sendEmail(subject, text) {
    const mailOptions = {
        from: 'onyenankiekelvin@gmailcom',
        to: this.to,
        subject,
        text
    };
    await this.newTransport().sendMail(mailOptions)
   }
   
   async sendSignupOtp(code) {
    await this.sendEmail(
        'TalkNTrade - Verify your account',
        `Your one-time 4 digit code is ${code}`
    )
   }
   async sendPasswordReset(url) {
    await this.sendEmail(
      'passwordReset',
      `Your password reset token (valid for only 10 minutes) - ${url}`
    );
  }
}

module.exports = {Email, generateOtp}