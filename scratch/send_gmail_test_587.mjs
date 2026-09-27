import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: 'aipassportindia@gmail.com',
    pass: 'zxltrpkkpxushepy'
  }
});

const certPath = path.resolve('./public/certificates/34.png');

const mailOptions = {
  from: '"Team AI Passport™ — Ekaakshar Education" <aipassportindia@gmail.com>',
  to: 'hr0417@gmail.com',
  subject: 'Official Certificate: AI Passport Live™ National Webinar for Educators',
  html: `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 40px 24px; max-width: 620px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(0,162,255,0.2);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 6px; font-weight: 800;">
          AI PASSPORT™
        </h1>
        <p style="color: #dfcfad; font-size: 13px; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
          Ekaakshar Education
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px; margin-bottom: 24px; line-height: 1.6; font-size: 15px; color: #e2e8f0;">
        <p style="margin-top: 0;"><strong>Dear Lavi,</strong></p>
        <p>Thank you for participating in the <strong>AI Passport Live™ National Webinar for Educators</strong> held on <strong>20 September 2026</strong>!</p>
        <p>We are pleased to present your official <strong>Certificate of Participation</strong> (Level 1 – AI Explorer).</p>
        <p style="background: rgba(223, 207, 173, 0.1); border: 1px solid rgba(223, 207, 173, 0.3); padding: 12px 16px; border-radius: 8px; color: #dfcfad; font-size: 14px;">
          📎 <strong>Your official certificate document is attached to this email as a high-resolution PNG image.</strong>
        </p>
        <p>Thank you for your commitment to transforming education and building with AI.</p>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; color: #94a3b8; font-size: 13px; line-height: 1.5;">
        <p style="margin: 0 0 4px; font-weight: 700; color: #ffffff;">Team AI Passport™</p>
        <p style="margin: 0 0 8px; color: #dfcfad;">Ekaakshar Education</p>
        <p style="margin: 0;"><a href="https://aipassport.ekaakshareducation.com" style="color: #58c4ff; text-decoration: none;">aipassport.ekaakshareducation.com</a></p>
      </div>
    </div>
  `,
  attachments: [
    {
      filename: 'AI_Passport_Certificate_Lavi_AIP-2026-0279.png',
      path: certPath
    }
  ]
};

async function sendTest() {
  console.log("Connecting to Gmail SMTP (port 587 STARTTLS) via aipassportindia@gmail.com...");
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("SUCCESS! Test email sent cleanly via port 587. Message ID:", info.messageId);
    process.exit(0);
  } catch(err) {
    console.error("SMTP Error:", err);
    process.exit(1);
  }
}

sendTest();
