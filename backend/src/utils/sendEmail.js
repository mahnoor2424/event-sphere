const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: "gmail", // Ya koi aur SMTP service
    auth: {
      user: "your-email@gmail.com", // Aapka email
      pass: "your-app-password",    // Gmail ka App Password
    },
  });

  await transporter.sendMail({
    from: '"Expo System" <your-email@gmail.com>',
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;