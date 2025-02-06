const nodemailer = require("nodemailer");
const credentials = require("../../credential/credential");

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
  // Create Email Transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: credentials.EMAIL_USER,
      pass: credentials.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Option for sending email
  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  };

  // send email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
