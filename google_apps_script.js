function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "AI Passport Live API",
    version: "2.0"
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
    sheet.appendRow([
      new Date(),
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
  var subject = "Seat Confirmed: AI Passport Live™ (20 Sept 2026)";
  var plainText = "Your seat is confirmed for AI Passport Live™. Theme: AI in Education – Preparing the Teacher for Viksit Bharat. Date: Sunday, 20 September 2026, 2:00 PM - 3:30 PM IST. Passport ID: " + passportId;

  // Render HTML from email_invitation file if present, or fallback to inline string
  var htmlBody = "";
  try {
    var template = HtmlService.createTemplateFromFile('email_invitation');
    template.userFullName = userFullName;
    template.passportId = passportId;
    template.userRole = userRole;
    htmlBody = template.evaluate().getContent();
  } catch (e) {
    htmlBody = getInlineHtmlEmail(userFullName, passportId, userRole);
  }

  GmailApp.sendEmail(userEmail, subject, plainText, {
    htmlBody: htmlBody,
    name: "AI Passport Team",
    bcc: "ekaakshareducation@gmail.com"
  });
}

function getInlineHtmlEmail(userFullName, passportId, userRole) {
  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="utf-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>AI Passport Live™ Confirmation Receipt</title>' +
'  <style type="text/css">' +
'    body { margin: 0; padding: 0; width: 100% !important; background-color: #06080F; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }' +
'    table { border-collapse: collapse !important; }' +
'    a { text-decoration: none; }' +
'    .btn-gold { background: linear-gradient(135deg, #DFCFAD 0%, #C5A880 100%); color: #08090E !important; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; }' +
'    .btn-whatsapp { background: #25D366; color: #08090E !important; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; }' +
'  </style>' +
'</head>' +
'<body style="margin: 0; padding: 0; background-color: #06080F; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">' +
'  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #06080F; padding: 40px 16px;">' +
'    <tr>' +
'      <td align="center">' +
'        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #0D101A; border: 1px solid rgba(223, 207, 173, 0.3); border-radius: 20px; padding: 40px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 24px;">' +
'              <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #DFCFAD; letter-spacing: 0.25em; text-transform: uppercase; display: block; margin-bottom: 6px;">EKAAKSHAR EDUCATION</span>' +
'              <h1 style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.15em; margin: 0; text-transform: uppercase;">AI PASSPORT™</h1>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 32px;">' +
'              <a href="https://aipassport.ekaakshareducation.com/live.html" target="_blank">' +
'                <img src="https://aipassport.ekaakshareducation.com/passport.png" alt="AI Passport Verified Identity Card" width="280" style="display: block; width: 100%; max-width: 280px; height: auto; border: 1px solid rgba(223, 207, 173, 0.4); border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,0.9);" />' +
'              </a>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="left" style="padding-bottom: 24px;">' +
'              <span style="font-size: 11px; font-weight: 700; color: #2ECC71; letter-spacing: 0.2em; text-transform: uppercase; display: block; margin-bottom: 8px;">✓ SEAT CONFIRMED &bull; FREE REGISTRATION</span>' +
'              <h2 style="font-size: 24px; font-weight: 700; color: #FFFFFF; margin: 0 0 10px 0; line-height: 1.3;">Your Seat is Confirmed for AI Passport Live™</h2>' +
'              <div style="background: rgba(223, 207, 173, 0.08); border-left: 3px solid #DFCFAD; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">' +
'                <p style="font-size: 13px; font-weight: 700; color: #DFCFAD; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">THEME: AI IN EDUCATION – PREPARING THE TEACHER FOR VIKSIT BHARAT</p>' +
'              </div>' +
'              <p style="font-size: 15px; line-height: 1.65; color: #CBD5E1; margin: 0;">Dear <strong>' + userFullName + '</strong>,<br><br>Welcome to AI Passport Live™. AI Passport™ is a growing record of what you learn, what you build and what you can prove with AI. We look forward to seeing you at this practical 90-minute live experience.</p>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 32px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141824; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px;">' +
'                <tr><td style="padding-bottom: 10px; font-size: 13px; color: #94A3B8;">PASSPORT ID</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #DFCFAD; font-family: monospace;">' + passportId + '</td></tr>' +
'                <tr><td style="padding-bottom: 10px; font-size: 13px; color: #94A3B8;">DATE</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #FFFFFF;">Sunday, 20 September 2026</td></tr>' +
'                <tr><td style="padding-bottom: 10px; font-size: 13px; color: #94A3B8;">TIME</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #DFCFAD;">2:00 PM – 3:30 PM IST</td></tr>' +
'                <tr><td style="padding-bottom: 10px; font-size: 13px; color: #94A3B8;">REGISTERED ROLE</td><td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #FFFFFF;">' + userRole + '</td></tr>' +
'                <tr><td style="font-size: 13px; color: #94A3B8;">ACCESS</td><td align="right" style="font-size: 14px; font-weight: 700; color: #2ECC71;">90 MINS &bull; LIVE &bull; FREE</td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 36px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
'                <tr>' +
'                  <td align="center">' +
'                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Passport+Live%3A+AI+in+Education+%E2%80%93+Preparing+the+Teacher+for+Viksit+Bharat&dates=20260920T083000Z/20260920T100000Z&details=A+free+90-minute+live+experience+for+teachers+and+educators.+Official+Portal%3A+https%3A%2F%2Faipassport.ekaakshareducation.com%2Flive.html&location=Online+Live+Webinar" target="_blank" class="btn-gold" style="margin-right: 8px; margin-bottom: 10px;">📅 ADD TO GOOGLE CALENDAR</a>' +
'                    <a href="https://api.whatsapp.com/send?text=I%20just%20registered%20for%20AI%20Passport%20Live%E2%84%A2%3A%20AI%20in%20Education%20%E2%80%93%20Preparing%20the%20Teacher%20for%20Viksit+Bharat%20(20%20September%202026).%20Register%20your%20free%20seat%20here%3A%20https%3A%2F%2Faipassport.ekaakshareducation.com%2Flive.html" target="_blank" class="btn-whatsapp" style="margin-bottom: 10px;">💬 SHARE ON WHATSAPP</a>' +
'                  </td>' +
'                </tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 28px;">' +
'              <h3 style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0;">What You Will Explore:</h3>' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">' +
'                <tr><td style="padding-bottom: 10px;"><strong style="color: #DFCFAD;">01 — UNDERSTAND:</strong> The current AI landscape and what it means for educators.</td></tr>' +
'                <tr><td style="padding-bottom: 10px;"><strong style="color: #DFCFAD;">02 — CREATE:</strong> Use AI to develop lessons, resources, presentations and learning content.</td></tr>' +
'                <tr><td style="padding-bottom: 10px;"><strong style="color: #DFCFAD;">03 — AUTOMATE:</strong> Discover repeatable workflows for everyday academic tasks.</td></tr>' +
'                <tr><td style="padding-bottom: 10px;"><strong style="color: #DFCFAD;">04 — BUILD:</strong> Move from individual prompts toward practical AI-powered tools.</td></tr>' +
'                <tr><td style="padding-bottom: 10px;"><strong style="color: #DFCFAD;">05 — THINK AHEAD:</strong> How to continue developing AI capability through AI Passport.</td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; font-size: 12px; color: #64748B; line-height: 1.6;">' +
'              <p style="margin: 0 0 6px 0; font-weight: 600; color: #94A3B8;">EKAAKSHAR EDUCATION SERVICES PVT. LTD.</p>' +
'              <p style="margin: 0 0 12px 0;">AI Passport Council™ Standards & Governance</p>' +
'              <p style="margin: 0;">Need assistance? Visit <a href="https://aipassport.ekaakshareducation.com/live.html" style="color: #DFCFAD; text-decoration: underline;">aipassport.ekaakshareducation.com</a></p>' +
'            </td>' +
'          </tr>' +
'        </table>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'</body>' +
'</html>';
}
