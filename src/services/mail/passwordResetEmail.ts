import nodemailer from "nodemailer";
import logger from "../../logs/helpers/logger";
import dotenv from "dotenv";

dotenv.config();

// Configuration
//const baseUrl = process.env.BASE_URL;
const host = process.env.EMAIL_HOST;
const port = process.env.EMAIL_PORT;
const secure = process.env.EMAIL_SECURE ;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Function to send the password reset email
const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host,
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: smtpUser,
      to: email,
      subject: "Password Reset Request",
      html: `
      <div style="background-color: #f0f0f0; padding: 20px; font-family: Arial, sans-serif;">
        <header style="background-color: #333; padding: 10px; color: #fff; text-align: center;">
          <h1> Ekazi </h1>
        </header>
        
        <div style="padding: 20px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Password Reset Request</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password.</p>
            <div style="display: flex; justify-content: center; gap: 10px;">
              ${resetToken
                .split("")
                .map(
                  (char) => `
                <div style="
                  width: 40px; 
                  height: 40px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  border: 1px solid #ccc; 
                  border-radius: 4px; 
                  font-size: 18px;
                  text-align: center;
                ">
                  ${char}
                </div>
              `
                )
                .join("")}
            </div>
            <p style="font-size: 14px; margin-top: 20px; color: #666;">The token will expire in 24 hours. If you did not request this, please ignore this email.</p>
          </div>
        </div>
        
        <footer style="background-color: #333; padding: 10px; color: #fff; text-align: center; font-size: 12px;">
          <p> Ekazi &copy; 2025. All rights reserved.</p>
        </footer>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    handleEmailError(error);
  }
};

// Error handling function
const handleEmailError = (error: any) => {
  logger.error(`Error sending password reset email: ${error.message}`, {
    metadata: {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    },
  });
  throw new Error(`Error sending password reset email: ${error.message}`);
};

export { sendPasswordResetEmail };
