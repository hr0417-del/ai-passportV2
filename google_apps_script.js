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
  var subject = "Your Seat is Confirmed — AI Passport Live™";
  var plainText = "20 September 2026 • Teachers & Educators • 2:00–3:30 PM IST\n\nYour seat is confirmed for AI Passport Live™. Theme: AI in Education – Preparing the Teacher for Viksit Bharat. Passport ID: " + passportId;

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
    name: "Ekaakshar Education",
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
'    body { margin: 0; padding: 0; width: 100% !important; background-color: #06080F; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }' +
'    table { border-collapse: collapse !important; }' +
'    a { text-decoration: none; }' +
'    .btn-gold { background: linear-gradient(135deg, #DFCFAD 0%, #C5A880 100%); color: #08090E !important; font-weight: 700; padding: 14px 26px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; }' +
'    .btn-whatsapp { background: #25D366; color: #08090E !important; font-weight: 700; padding: 14px 26px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; }' +
'    @media screen and (max-width: 600px) {' +
'      .email-container { width: 100% !important; padding: 28px 18px !important; }' +
'      .btn-stack { display: block !important; width: 100% !important; margin-bottom: 12px !important; text-align: center !important; box-sizing: border-box !important; }' +
'    }' +
'  </style>' +
'</head>' +
'<body style="margin: 0; padding: 0; background-color: #06080F; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">' +
'  <div style="display: none; font-size: 1px; color: #06080F; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">20 September 2026 &bull; Teachers &amp; Educators &bull; 2:00&ndash;3:30 PM IST</div>' +
'  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #06080F; padding: 40px 16px;">' +
'    <tr>' +
'      <td align="center">' +
'        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #0D101A; border: 1px solid rgba(223, 207, 173, 0.25); border-radius: 20px; padding: 40px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.85);">' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 28px;">' +
'              <span style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #DFCFAD; letter-spacing: 0.18em; text-transform: uppercase; display: block; margin-bottom: 6px;">EKAAKSHAR EDUCATION</span>' +
'              <h1 style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.15em; margin: 0 0 8px 0; text-transform: uppercase;">AI PASSPORT™</h1>' +
'              <span style="font-size: 10px; font-weight: 600; color: #94A3B8; letter-spacing: 0.18em; text-transform: uppercase; display: block;">AI CAPABILITY &bull; VERIFIED PROGRESS &bull; REAL-WORLD PROOF</span>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 32px;">' +
'              <a href="https://aipassport.ekaakshareducation.com/" target="_blank">' +
'                <img src="https://aipassport.ekaakshareducation.com/FRAME%201.webp" alt="AI Passport Verified Identity Card" width="280" style="display: block; width: 100%; max-width: 280px; height: auto; border: 1px solid rgba(223, 207, 173, 0.35); border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.85);" />' +
'              </a>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="left" style="padding-bottom: 24px;">' +
'              <span style="font-size: 11px; font-weight: 700; color: #2ECC71; letter-spacing: 0.2em; text-transform: uppercase; display: block; margin-bottom: 8px;">✓ SEAT CONFIRMED &bull; FREE REGISTRATION</span>' +
'              <h2 style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin: 0 0 4px 0; line-height: 1.25;">YOUR SEAT IS CONFIRMED</h2>' +
'              <div style="font-size: 16px; font-weight: 700; color: #DFCFAD; letter-spacing: 0.05em; margin-bottom: 14px;">AI Passport Live™</div>' +
'              <p style="font-size: 15px; line-height: 1.65; color: #CBD5E1; margin: 0;">Dear <strong>' + firstName + '</strong>,<br><br>Welcome to AI Passport Live™. You are confirmed for this practical 90-minute experience designed specifically for teachers and educators.</p>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 32px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141824; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px 24px;">' +
'                <tr><td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; letter-spacing: 0.05em;">PASSPORT ID</td><td align="right" style="padding-bottom: 12px; font-size: 15px; font-weight: 700; color: #DFCFAD; font-family: monospace; letter-spacing: 0.05em;">' + passportId + '</td></tr>' +
'                <tr><td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; letter-spacing: 0.05em;">DATE</td><td align="right" style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #FFFFFF;">Sunday, 20 September 2026</td></tr>' +
'                <tr><td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; letter-spacing: 0.05em;">TIME</td><td align="right" style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #DFCFAD;">2:00 PM &ndash; 3:30 PM IST</td></tr>' +
'                <tr><td style="padding-bottom: 12px; font-size: 12px; font-weight: 600; color: #94A3B8; letter-spacing: 0.05em;">FOR</td><td align="right" style="padding-bottom: 12px; font-size: 14px; font-weight: 600; color: #FFFFFF;">Teachers &amp; Educators</td></tr>' +
'                <tr><td style="font-size: 12px; font-weight: 600; color: #94A3B8; letter-spacing: 0.05em;">ACCESS</td><td align="right" style="font-size: 14px; font-weight: 700; color: #2ECC71;">90 MIN &bull; LIVE &bull; FREE</td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 36px;">' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
'                <tr>' +
'                  <td align="center">' +
'                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Passport+Live%3A+AI+in+Education+%E2%80%93+Preparing+the+Teacher+for+Viksit+Bharat&dates=20260920T083000Z/20260920T100000Z&details=A+free+90-minute+live+experience+for+teachers+and+educators.+Official+Portal%3A+https%3A%2F%2Faipassport.ekaakshareducation.com%2Flive.html&location=Online+Live+Webinar" target="_blank" class="btn-gold" style="margin-right: 8px; margin-bottom: 10px;">ADD TO GOOGLE CALENDAR</a>' +
'                    <a href="https://api.whatsapp.com/send?text=I%E2%80%99m%20attending%20AI%20Passport%20Live%E2%84%A2%20by%20Ekaakshar%20Education%20on%2020%20September%202026.%0A%0AA%20practical%2090-minute%20session%20for%20teachers%20and%20educators%20on%20understanding%2C%20creating%2C%20automating%20and%20building%20with%20AI.%0A%0A2%3A00%20PM%20%E2%80%93%203%3A30%20PM%20IST%0AFree%20%E2%80%A2%20Live%0A%0ALearn%20more%3A%0Ahttps%3A%2F%2Faipassport.ekaakshareducation.com%2F" target="_blank" class="btn-whatsapp" style="margin-bottom: 10px;">SHARE ON WHATSAPP</a>' +
'                  </td>' +
'                </tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td style="padding-bottom: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 28px;">' +
'              <h3 style="font-size: 15px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px 0;">WHAT YOU WILL EXPLORE</h3>' +
'              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; line-height: 1.6; color: #CBD5E1;">' +
'                <tr><td style="padding-bottom: 12px;"><strong style="color: #DFCFAD;">01 &mdash; UNDERSTAND</strong><br><span style="color: #94A3B8; font-size: 13px;">The AI landscape and what it means for educators.</span></td></tr>' +
'                <tr><td style="padding-bottom: 12px;"><strong style="color: #DFCFAD;">02 &mdash; CREATE</strong><br><span style="color: #94A3B8; font-size: 13px;">Use AI to develop lessons, resources and learning content.</span></td></tr>' +
'                <tr><td style="padding-bottom: 12px;"><strong style="color: #DFCFAD;">03 &mdash; AUTOMATE</strong><br><span style="color: #94A3B8; font-size: 13px;">Discover practical workflows for everyday academic tasks.</span></td></tr>' +
'                <tr><td style="padding-bottom: 12px;"><strong style="color: #DFCFAD;">04 &mdash; BUILD</strong><br><span style="color: #94A3B8; font-size: 13px;">Move beyond prompts toward practical AI-powered tools.</span></td></tr>' +
'                <tr><td style="padding-bottom: 12px;"><strong style="color: #DFCFAD;">05 &mdash; THINK AHEAD</strong><br><span style="color: #94A3B8; font-size: 13px;">Explore how to continue building your AI capability through AI Passport™.</span></td></tr>' +
'              </table>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="padding-bottom: 28px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px;">' +
'              <div style="font-size: 13px; font-weight: 800; color: #DFCFAD; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.4;">DON&rsquo;T JUST LEARN AI.<br>BUILD WITH IT.</div>' +
'            </td>' +
'          </tr>' +
'          <tr>' +
'            <td align="center" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; font-size: 12px; color: #64748B; line-height: 1.6;">' +
'              <p style="margin: 0 0 6px 0; font-weight: 700; color: #94A3B8; letter-spacing: 0.05em;">Ekaakshar Education</p>' +
'              <p style="margin: 0 0 6px 0; font-weight: 600; color: #DFCFAD;">AI Passport Council™ &mdash; Standards &amp; Governance</p>' +
'              <p style="margin: 0 0 10px 0; color: #64748B;">Building AI capability for the AI era.</p>' +
'              <p style="margin: 0 0 4px 0;"><a href="https://aipassport.ekaakshareducation.com/" style="color: #DFCFAD; text-decoration: underline;">aipassport.ekaakshareducation.com</a></p>' +
'              <p style="margin: 0; color: #94A3B8;">Helpline: +91 87962 55005</p>' +
'            </td>' +
'          </tr>' +
'        </table>' +
'      </td>' +
'    </tr>' +
'  </table>' +
'</body>' +
'</html>';
}
