import nodemailer from 'nodemailer';
import logger from "../../logs/helpers/logger";
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const host = process.env.EMAIL_HOST || '';
const port = Number(process.env.EMAIL_PORT)
const secure = process.env.EMAIL_SECURE === 'true';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

// Email transporter setup
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send email verification email
const sendEmailVerificationToUser = async (recipientEmail: string, verificationToken: string) => {
  try {
    const verificationLink = `https://heart.starlinkkenya.com/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: smtpUser,
      to: recipientEmail,
      subject: 'Email Verification - Please Confirm Your Email Address',
      html: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <header style="background-color: #15271B; padding: 10px; color: #fff; text-align: center;">
            <h1>Ekazi</h1>
          </header>
          <div style="padding: 20px;">
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="font-size: 18px; margin-bottom: 10px;">Verify Your Email Address</h2>
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for registering with us. Please click the link below to verify your email address:</p>
              <p style="font-size: 16px; font-weight: bold;">
                <a href="${verificationLink}" style="color: #1a73e8; text-decoration: none;">Verify My Email</a>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not request this, please ignore this email.</p>
            </div>
          </div>
          <footer style="background-color: #15271B; padding: 20px; color: #fff; text-align: center; font-size: 14px;">
            <p>Follow us on:</p>
            <a href="" style="color: #fff; margin-right: 10px;">Facebook</a> |
            <a href="" style="color: #fff; margin-left: 10px; margin-right: 10px;">Twitter</a> |
            <a href="" style="color: #fff; margin-left: 10px;">Instagram</a>
            <p>Ekazi &copy; 2025. All rights reserved.</p>
          </footer>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    logger.error(`Error sending verification email: ${error.message}`, {
      metadata: {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      },
    });
  }
};

export { sendEmailVerificationToUser };
