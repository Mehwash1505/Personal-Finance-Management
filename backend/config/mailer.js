const nodemailer = require('nodemailer');

let transporter;  

// Yeh function Ethereal se ek TEST account banayega
const setupTransporter = async () => { 
  if (transporter) return transporter; // Sirf ek baar banao
 
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 587, // true for 587, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Connection ko verify kar lete hain
    await transporter.verify();
    console.log(" Mail transporter is ready to send emails.");
    
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
      from: '"PFM Dashboard" <asmanasreen388@gmail.com>',
      to: to, // email address
      subject: subject,
      text: text,
      html: html,
    });

    console.log('Message sent: %s', info.messageId);

    // Preview URL Ethereal par email check karne ke liye
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { setupTransporter, sendEmail };
