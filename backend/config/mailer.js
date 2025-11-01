const nodemailer = require('nodemailer');

let transporter;

// Yeh function Ethereal se ek TEST account banayega
const setupTransporter = async () => {
  if (transporter) return transporter; // Sirf ek baar banao

  try {
    // Agar .env mein USER/PASS nahi hai, toh naya test account banao
    if (!process.env.EMAIL_USER) {
      const testAccount = await nodemailer.createTestAccount();
      console.log('--- Ethereal Test Account Created ---');
      console.log('User:', testAccount.user);
      console.log('Pass:', testAccount.pass);
      console.log('-----------------------------------');
      console.log('NOTE: Inka USER aur PASS apne .env file mein daal do taaki baar baar naya account na bane!');
      
      // .env mein daal do yeh values
      process.env.EMAIL_USER = testAccount.user;
      process.env.EMAIL_PASS = testAccount.pass;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    return transporter;
  } catch (error) {
    console.error("Error setting up mail transporter:", error);
  }
};

// Yeh hamara main email bhejme wala function hai
const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    await setupTransporter();
  }
  
  try {
    const info = await transporter.sendMail({
      from: '"PFM Dashboard 👻" <noreply@pfm-dashboard.com>',
      to: to, // email address
      subject: subject,
      text: text,
      html: html,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview URL Ethereal par email check karne ke liye
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { setupTransporter, sendEmail };