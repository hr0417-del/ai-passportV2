import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aipassportindia@gmail.com',
    pass: 'zxlt rpkk pxus hepy'
  }
});

const fullname = "Educator / Tester";
const passportId = "AIP-2026-0888";
const role = "School Teacher / Educator";
const email = "hr0417@gmail.com";

const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding-bottom: 28px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0F172A; border-radius: 12px; padding: 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 700; color: #DFCFAD; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4px;">
                      EKAAKSHAR EDUCATION
                    </div>
                    <h1 style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.15em; margin: 0 0 6px 0; text-transform: uppercase;">
                      AI PASSPORT™
                    </h1>
                    <div style="font-size: 11px; font-weight: 500; color: #94A3B8; letter-spacing: 0.08em;">
                      Building AI capability for the AI era.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td align="left" style="padding-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 700; color: #16A34A; letter-spacing: 0.18em; text-transform: uppercase; display: block; margin-bottom: 8px;">
                ✓ SEAT CONFIRMED • FREE REGISTRATION
              </span>
              <h2 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; line-height: 1.25;">
                YOUR SEAT IS CONFIRMED
              </h2>
              <div style="font-size: 16px; font-weight: 700; color: #B45309; letter-spacing: 0.02em; margin-bottom: 12px;">
                AI Passport Live™
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0;">
                A practical AI experience for teachers and educators.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 12px 0 0 0;">
                Dear <strong>${fullname}</strong>,<br><br>
                Welcome to AI Passport Live™. Your registration is confirmed.
              </p>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding-bottom: 28px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #0F172A; border-radius: 8px; padding: 20px 24px;">
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">PASSPORT ID</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A; font-family: monospace;">${passportId}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">ROLE REGISTERED</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">${role}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">FORMAT</td>
                  <td align="right" style="font-size: 14px; font-weight: 700; color: #16A34A;">ONLINE • FREE</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td align="center" style="padding-bottom: 28px; border-top: 1px solid #E2E8F0; padding-top: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Passport+Live%3A+AI+in+Education&details=Free+live+experience+for+teachers+and+educators.+Official+Portal%3A+https%3A%2F%2Faipassport.ekaakshareducation.com%2F&location=Online+Live+Webinar" target="_blank" style="background-color: #0F172A; color: #FFFFFF; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; margin-right: 8px; margin-bottom: 12px;">
                      ADD TO CALENDAR &rarr;
                    </a>
                    <a href="https://api.whatsapp.com/send?text=I%27m%20attending%20AI%20Passport%20Live%E2%84%A2%20%E2%80%94%20a%20free%20practical%20AI%20webinar%20for%20teachers%20and%20educators!%20Learn%20more%3A%20https%3A%2F%2Faipassport.ekaakshareducation.com%2F" target="_blank" style="background-color: #F8FAFC; color: #0F172A; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; border: 1px solid #CBD5E1; margin-bottom: 12px;">
                      SHARE ON WHATSAPP &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td align="center" style="padding-bottom: 24px; border-top: 1px solid #E2E8F0; padding-top: 20px;">
              <div style="font-size: 12px; font-weight: 800; color: #0F172A; letter-spacing: 0.12em; text-transform: uppercase;">
                DON'T JUST LEARN AI. BUILD WITH IT.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 12px; color: #64748B; line-height: 1.6;">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #0F172A;">AI Passport™</p>
              <p style="margin: 0 0 4px 0; color: #64748B;">Building AI capability for the AI era.</p>
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">Ekaakshar Education</p>
              <p style="margin: 0 0 4px 0;"><a href="https://aipassport.ekaakshareducation.com/" style="color: #0F172A; text-decoration: underline;">aipassport.ekaakshareducation.com</a></p>
              <p style="margin: 0; color: #64748B;">Helpline: 8796255005</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function sendTestEmail() {
  console.log(`Sending test registration confirmation email to ${email}...`);
  try {
    const info = await transporter.sendMail({
      from: '"AI Passport™ by Ekaakshar Education" <aipassportindia@gmail.com>',
      to: email,
      subject: `SEAT CONFIRMED: AI Passport Live™ National Webinar — ${passportId}`,
      html: htmlBody
    });
    console.log(`✅ TEST EMAIL SENT SUCCESSFULLY! MessageId: ${info.messageId}`);
  } catch(err) {
    console.error(`❌ ERROR SENDING TEST EMAIL:`, err);
  }
}

sendTestEmail();
