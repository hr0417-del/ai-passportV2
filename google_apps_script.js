function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "AI Passport Live API",
    version: "4.1"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var email = (data.email || "").toString().trim();
    var mobile = (data.mobile || "").toString().trim();
    var fullname = (data.fullname || "Citizen Builder").toString().trim();
    var role = (data.role || "Educator").toString().trim();
    var use_case = (data.use_case || "").toString().trim();
    var city = (data.city || "").toString().trim();
    
    // Check duplicates on or after 12/09/2026
    var cutoffDate = new Date(2026, 8, 12); // Sept 12, 2026
    var rows = sheet.getDataRange().getValues();
    var isDuplicate = false;
    
    for (var i = 1; i < rows.length; i++) {
      var rowDate = new Date(rows[i][0]);
      var rowEmail = (rows[i][2] || "").toString().trim().toLowerCase();
      var rowMobile = (rows[i][3] || "").toString().trim();
      
      if (rowDate >= cutoffDate) {
        if ((email && rowEmail === email.toLowerCase()) || (mobile && rowMobile === mobile)) {
          isDuplicate = true;
          break;
        }
      }
    }
    
    if (isDuplicate) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        duplicate: true,
        message: "User already exists. Please register with a new credential."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Generate Passport ID
    var newRowNumber = rows.length + 1;
    var passportId = "AIP-2026-" + ("0000" + newRowNumber).slice(-4);
    
    // Append row
    var now = new Date();
    sheet.appendRow([
      now,
      fullname,
      email,
      mobile,
      role,
      use_case,
      city,
      passportId
    ]);
    
    // Send Confirmation Email
    if (email) {
      sendConfirmationEmail(email, fullname, passportId, role);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      passportId: passportId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(userEmail, userFullName, passportId, userRole) {
  var subject = "Your Seat is Confirmed — AI Passport Live™";
  var plainText = "20 September 2026 • Teachers & Educators • 2:00 PM – 3:30 PM IST\n\n" +
                  "Your seat is confirmed for AI Passport Live™. A practical AI experience for teachers and educators.\n" +
                  "Passport ID: " + passportId + "\n\n" +
                  "Learn more: https://aipassport.ekaakshareducation.com/";

  // Extract clean first name
  var firstName = "Educator";
  if (userFullName && userFullName.trim()) {
    var parts = userFullName.trim().split(/\s+/);
    if (parts.length > 0 && parts[0]) {
      firstName = parts[0];
    }
  }

  var htmlBody = getInlineHtmlEmail(firstName, passportId, userRole);

  GmailApp.sendEmail(userEmail, subject, plainText, {
    htmlBody: htmlBody,
    name: "AI Passport™ by Ekaakshar Education",
    replyTo: "aipassportindia@gmail.com",
    bcc: "ekaakshareducation@gmail.com"
  });
}

function getInlineHtmlEmail(firstName, passportId, userRole) {
  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="utf-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>Your Seat is Confirmed — AI Passport Live™</title>' +
'  <style type="text/css">' +
'    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }' +
'    table { border-collapse: collapse !important; }' +
'    a { text-decoration: none; }' +
'    .btn-primary { background-color: #0F172A; color: #FFFFFF !important; font-weight: 700; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid #1E293B; }' +
'    .btn-secondary { background-color: #F8FAFC; color: #0F172A !important; font-weight: 700; padding: 14px 28px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid #CBD5E1; }' +
'    @media screen and (max-width: 600px) {' +
'      .email-container { width: 100% !important; padding: 24px 16px !important; }' +
'      .btn-stack { display: block !important; width: 100% !important; margin-bottom: 12px !important; text-align: center !important; box-sizing: border-box !important; }' +
'    }' +
'  </style>' +
'</head>' +
'<body style="margin: 0; padding: 0; background-color: #F1F5F9; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">' +
'  <div style="display: none; font-size: 1px; color: #F1F5F9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">20 September 2026 &bull; Teachers &amp; Educators &bull; 2:00 PM &ndash; 3:30 PM IST</div>' +
'  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; padding: 32px 12px;">' +
'    <tr>' +
'      <td align="center">' +
'        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">' +
'          <tr>' +
'            <td style="padding-bottom: 28px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0F172A; border-radius: 12px; padding: 24px; text-align: center;">' +
'                <tr>' +
'                  <td align="center">' +
'                    <div style="font-size: 11px; font-weight: 700; color: #DFCFAD; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4px;">EKAAKSHAR EDUCATION</div>' +
'                    <h1 style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.15em; margin: 0 0 6px 0; text-transform: uppercase;">AI PASSPORT™</h1>' +
'                    <div style="font-size: 11px; font-weight: 500; color: #94A3B8; letter-spacing: 0.08em;">Building AI capability for the AI era.</div>' +
'                  </td>' +
'                </tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="left" style="padding-bottom: 24px;">' +
'              <span style="font-size: 11px; font-weight: 700; color: #16A34A; letter-spacing: 0.18em; text-transform: uppercase; display: block; margin-bottom: 8px;">✓ SEAT CONFIRMED &bull; FREE REGISTRATION</span>' +
'              <h2 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; line-height: 1.25;">YOUR SEAT IS CONFIRMED</h2>' +
'              <div style="font-size: 16px; font-weight: 700; color: #B45309; letter-spacing: 0.02em; margin-bottom: 12px;">AI Passport Live™</div>' +
'              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0;">A practical AI experience for teachers and educators.</p>' +
'              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 12px 0 0 0;">Dear <strong>' + firstName + '</strong>,<br><br>Welcome to AI Passport Live™. Your registration is confirmed.</p>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 28px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #0F172A; border-radius: 8px; padding: 20px 24px;">' +
'                <tr><td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">PASSPORT ID</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A; font-family: monospace;">' + passportId + '</td></tr>' +
'                <tr><td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">DATE</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">20 SEPTEMBER 2026</td></tr>' +
'                <tr><td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">TIME</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">2:00 PM &ndash; 3:30 PM IST</td></tr>' +
'                <tr><td style="font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">FORMAT</td><td align="right" style="font-size: 14px; font-weight: 700; color: #16A34A;">ONLINE &bull; FREE</td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 28px; border-top: 1px solid #E2E8F0; padding-top: 24px;">' +
'              <h3 style="font-size: 14px; font-weight: 800; color: #0F172A; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px 0;">WHAT YOU&rsquo;LL EXPERIENCE</h3>' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6; color: #334155;">' +
'                <tr><td style="padding-bottom: 8px;">&bull; Understand how AI is changing teaching and learning</td></tr>' +
'                <tr><td style="padding-bottom: 8px;">&bull; Explore practical AI tools and workflows</td></tr>' +
'                <tr><td style="padding-bottom: 8px;">&bull; See how educators can use AI more effectively</td></tr>' +
'                <tr><td style="padding-bottom: 8px;">&bull; Move beyond simply using AI toward building with it</td></tr>' +
'                <tr><td style="padding-bottom: 8px;">&bull; Discover the AI Passport journey for developing practical AI capability</td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 28px; border-top: 1px solid #E2E8F0; padding-top: 24px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
'                <tr>' +
'                  <td align="center">' +
'                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Passport+Live%3A+AI+in+Education+%E2%80%93+Preparing+the+Teacher+for+Viksit+Bharat&dates=20260920T083000Z/20260920T100000Z&details=A+free+90-minute+live+experience+for+teachers+and+educators.+Official+Portal%3A+https%3A%2F%2Faipassport.ekaakshareducation.com%2Flive.html&location=Online+Live+Webinar" target="_blank" class="btn-primary" style="margin-right: 8px; margin-bottom: 10px;">ADD TO CALENDAR &rarr;</a>' +
'                    <a href="https://api.whatsapp.com/send?text=I%27m%20attending%20AI%20Passport%20Live%E2%84%A2%20%E2%80%94%20a%20free%20practical%20AI%20webinar%20for%20teachers%20and%20educators%20on%2020%20September%202026%2C%20from%202%3A00%20PM%20to%203%3A30%20PM%20IST.%0A%0ALearn%20more%3A%0Ahttps%3A%2F%2Faipassport.ekaakshareducation.com%2F" target="_blank" class="btn-secondary" style="margin-bottom: 10px;">SHARE ON WHATSAPP &rarr;</a>' +
'                  </td>' +
'                </tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 24px; border-top: 1px solid #E2E8F0; padding-top: 20px;">' +
'              <div style="font-size: 12px; font-weight: 800; color: #0F172A; letter-spacing: 0.12em; text-transform: uppercase;">DON&rsquo;T JUST LEARN AI. BUILD WITH IT.</div>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 12px; color: #64748B; line-height: 1.6;">' +
'              <p style="margin: 0 0 4px 0; font-weight: 700; color: #0F172A;">AI Passport™</p>' +
'              <p style="margin: 0 0 4px 0; color: #64748B;">Building AI capability for the AI era.</p>' +
'              <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">Ekaakshar Education</p>' +
'              <p style="margin: 0 0 4px 0;"><a href="https://aipassport.ekaakshareducation.com/" style="color: #0F172A; text-decoration: underline;">aipassport.ekaakshareducation.com</a></p>' +
'              <p style="margin: 0; color: #64748B;">Helpline: 8796255005</p>' +
'            </td>' +
'          </tr>' +
'        </table>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'</body>' +
'</html>';
}
