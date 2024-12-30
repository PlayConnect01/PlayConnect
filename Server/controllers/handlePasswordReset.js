const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: "ahmedboukottaya@zohomail.com",
    pass: "53nDUtDC4CKF",
  },
});

// In-memory store for codes (for demonstration purposes)
const recoveryCodes = {};

// Send recovery code via email
const sendCode = async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit code

  try {
    // Verify email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { username: true }, // Select only the username
    });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Store the code with the email as key
    recoveryCodes[email] = code;

    const mailOptions = {
      from: "ahmedboukottaya@zohomail.com",
      to: email,
      subject: "Password Recovery Code",
      html: `
        <div style="
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        ">
          <div style="
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px 8px 0 0;
            border-bottom: 3px solid #0066cc;
          ">
            <h2 style="
              color: #0066cc;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            ">Password Recovery</h2>
          </div>
    
          <div style="padding: 30px 20px;">
            <p style="
              color: #2c3e50;
              margin-bottom: 25px;
              font-size: 16px;
            ">Hello <strong>${user.username}</strong>,</p>
            
            <p style="
              color: #2c3e50;
              margin-bottom: 25px;
              font-size: 16px;
            ">We received a request to reset the password associated with your account. To proceed with resetting your password, please use the recovery code below:</p>
            
            <div style="
              display: flex;
              gap: 8px;
              justify-content: center;
              margin: 35px 0;
            ">
              ${String(code)
                .split("")
                .map(
                  (digit) => `
                  <div style="
                    display: inline-block;
                    padding: 15px;
                    border: 2px solid #0066cc;
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    width: 45px;
                    height: 45px;
                    line-height: 45px;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    color: #0066cc;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                  ">
                    ${digit}
                  </div>
                `
                )
                .join("")}
            </div>
    
            <div style="
              background-color: #f8f9fa;
              border-left: 4px solid #ffd700;
              padding: 15px;
              margin: 25px 0;
              border-radius: 4px;
            ">
              <p style="
                color: #666;
                margin: 0;
                font-size: 14px;
              ">
                <strong>Security Note:</strong> If you did not request a password reset, you can safely ignore this email. Rest assured, your account remains secure.
              </p>
            </div>
    
            <p style="
              color: #2c3e50;
              margin-bottom: 25px;
              font-size: 16px;
            ">For further assistance, feel free to contact our support team.</p>
            
            <hr style="
              border: none;
              border-top: 1px solid #e1e4e8;
              margin: 30px 0;
            ">
            
            <div style="
              text-align: center;
              color: #666;
              font-size: 14px;
            ">
              <p style="margin: 5px 0;">Thank you,<br><strong>The Support Team</strong></p>
            </div>
          </div>
    
          <div style="
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
            color: #666;
          ">
            <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email", error });
      }
      res
        .status(200)
        .json({ message: "Recovery code sent successfully via email" });
    });
  } catch (error) {
    console.error("Error sending code:", error);
    res.status(500).json({ message: "Failed to send recovery code" });
  }
};

// Verify the recovery code
const verifyCode = (req, res) => {
  const { email, code } = req.body;

  try {
    if (recoveryCodes[email] === parseInt(code)) {
      // Code is valid
      delete recoveryCodes[email]; // Remove the code after successful verification
      res.status(200).json({ message: "Code verified successfully" });
    } else {
      // Code is invalid
      res.status(400).json({ message: "Invalid recovery code" });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database using Prisma
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

// Export all functions
module.exports = {
  sendCode,
  verifyCode,
  updatePassword,
};