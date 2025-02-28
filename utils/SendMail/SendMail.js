const nodemailer = require("nodemailer");
const credentials = require("../../credential/credential");

const sendEmail = async (subject, message, send_to, sent_from, reply_to) => {
  try {
    // Validate email format
    if (!send_to || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(send_to)) {
      throw new Error(`Invalid recipient email address: ${send_to}`);
    }

    // Create Email Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: credentials.EMAIL_USER, // Secure credentials
        pass: credentials.EMAIL_PASS,
      },
    });

    // Email options
    const options = {
      from: sent_from || credentials.EMAIL_USER, // Use a valid email
      to: send_to,
      replyTo: reply_to || credentials.EMAIL_USER, // Fallback reply-to
      subject: subject,
      html: message,
    };

    // Send email
    const info = await transporter.sendMail(options);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
