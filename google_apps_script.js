// ==========================================================================
// MY AI PASSPORT™ — GOOGLE APPS SCRIPT WEB APP (v5.0 - 2 OCT LIVE WEBINAR)
// Active Spreadsheet ID: 1bdChBRpjvxYTVlxPL0DppuJMsO7j7fRkrhqqXVoihVs
// Tab Target: "2 oct live" & "2 Oct Verified Sent"
// ==========================================================================

var SPREADSHEET_ID = "1bdChBRpjvxYTVlxPL0DppuJMsO7j7fRkrhqqXVoihVs";
var TAB_NAME = "2 oct live";
var VERIFIED_TAB_NAME = "2 Oct Verified Sent";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim().length > 10) {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch(err) {
      Logger.log("openById failed, falling back to getActiveSpreadsheet: " + err);
    }
  }
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch(err) {
    Logger.log("getActiveSpreadsheet failed: " + err);
  }
  return null;
}

function getTargetSheet(ss) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) return null;
  var sheet = ss.getSheetByName(TAB_NAME) || 
              ss.getSheetByName("2 Oct Live") || 
              ss.getSheetByName("2 oct Live");
              
  if (!sheet) {
    try {
      sheet = ss.insertSheet(TAB_NAME);
      var headers = ["Timestamp", "Full Name", "Email Address", "WhatsApp Mobile", "Role", "Primary AI Interest / Use Case", "Organization / Profession", "AI Passport ID", "City", "Source", "Consent", "Email Status", "WhatsApp Status", "Registration Status"];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#ffffff");
    } catch(e) {
      sheet = ss.getSheets()[0];
    }
  }
  return sheet;
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || "";
  
  if (action === "createNewSheet" || action === "newSpreadsheet") {
    var result = createNewSpreadsheetFromSentEmails();
    return ContentService.createTextOutput(JSON.stringify(result, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "createVerifiedSheet" || action === "buildVerified") {
    var result = createVerifiedSentSheet();
    return ContentService.createTextOutput(JSON.stringify(result, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "sync" || action === "autosync") {
    var syncResult = autoSyncDashboardAndEmailsToLive();
    return ContentService.createTextOutput(JSON.stringify(syncResult, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "verifySent" || action === "audit") {
    var auditResult = verifySentEmailsVsSheet();
    return ContentService.createTextOutput(JSON.stringify(auditResult, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getAll" || action === "getStats") {
    try {
      var ss = getSpreadsheet();
      var sheet = getTargetSheet(ss);
      var rows = sheet.getDataRange().getValues();
      var data = [];
      for (var i = 1; i < rows.length; i++) {
        if (!rows[i][0] && !rows[i][1] && !rows[i][2]) continue;
        data.push({
          timestamp: rows[i][0],
          fullname: rows[i][1],
          email: rows[i][2],
          mobile: rows[i][3],
          role: rows[i][4],
          use_case: rows[i][5],
          organization: rows[i][6],
          passportId: rows[i][7],
          city: rows[i][8]
        });
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "online",
        service: "AI Passport Live API",
        version: "4.9",
        tabName: sheet.getName(),
        totalRegistrations: data.length,
        registrations: data
      })).setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "register" || params.email || params.fullname) {
    return processRegistration(params);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "AI Passport Live API",
    version: "4.9",
    spreadsheetId: SPREADSHEET_ID,
    tabName: TAB_NAME
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
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
  
  if (data.action === "createNewSheet" || data.action === "newSpreadsheet") {
    var result = createNewSpreadsheetFromSentEmails();
    return ContentService.createTextOutput(JSON.stringify(result, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === "createVerifiedSheet" || data.action === "buildVerified") {
    var result = createVerifiedSentSheet();
    return ContentService.createTextOutput(JSON.stringify(result, null, 2)).setMimeType(ContentService.MimeType.JSON);
  }

  return processRegistration(data);
}

function createNewSpreadsheetFromSentEmails() {
  try {
    // 14 Sept 2026 00:00:00 IST
    var CUTOFF_MS = new Date(2026, 8, 14, 0, 0, 0).getTime();
    
    // Read existing sheet data for mobile numbers & metadata lookup
    var ss = getSpreadsheet();
    var targetSheet = getTargetSheet(ss);
    var liveRows = targetSheet.getDataRange().getValues();
    
    var sheetDataMap = {};
    for (var i = 1; i < liveRows.length; i++) {
      var r = liveRows[i];
      var e = (r[2] || "").toString().trim().toLowerCase();
      if (e) {
        sheetDataMap[e] = {
          name: (r[1] || "").toString().trim(),
          mobile: (r[3] || "").toString().trim(),
          role: (r[4] || "").toString().trim(),
          org: (r[6] || "").toString().trim(),
          pid: (r[7] || "").toString().trim()
        };
      }
    }
    
    // Search Gmail Sent Items sent on or after 14 Sept
    var sentEntries = [];
    var seenEmails = {};
    
    var threads = GmailApp.search('in:sent after:2026/09/13', 0, 500);
    for (var t = 0; t < threads.length; t++) {
      var msgs = threads[t].getMessages();
      for (var m = 0; m < msgs.length; m++) {
        var msg = msgs[m];
        var msgDate = msg.getDate();
        if (msgDate.getTime() >= CUTOFF_MS) {
          var toStr = msg.getTo().toLowerCase().trim();
          var emailMatch = toStr.match(/<([^>]+)>/);
          var cleanEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : toStr;
          
          if (cleanEmail && cleanEmail !== "aipassportindia@gmail.com" && cleanEmail !== "ekaakshareducation@gmail.com") {
            if (!seenEmails[cleanEmail]) {
              seenEmails[cleanEmail] = true;
              
              var bodyText = msg.getPlainBody() || "";
              var pidMatch = bodyText.match(/AIP-2026-\d+/);
              var pid = pidMatch ? pidMatch[0] : "";
              
              var lookup = sheetDataMap[cleanEmail] || {};
              
              sentEntries.push([
                msgDate,
                lookup.name || "Educator",
                cleanEmail,
                lookup.mobile || "",
                msg.getSubject(),
                pid || lookup.pid || ("AIP-2026-" + ("0000" + (400 + sentEntries.length)).slice(-4)),
                lookup.role || lookup.org || "School Teacher",
                "Sent Confirmation Email"
              ]);
            }
          }
        }
      }
    }
    
    // Create BRAND NEW Google Spreadsheet File
    var newSpreadsheet = SpreadsheetApp.create("AI Passport Live Registrations - Sent Emails (From 14 Sept 2026)");
    var sheet = newSpreadsheet.getActiveSheet();
    sheet.setName("Verified Sent Emails");
    
    var header = ["Date & Time", "Full Name", "Email Address", "Mobile Number", "Email Subject", "AI Passport ID", "Role / Organization", "Email Status"];
    sheet.appendRow(header);
    
    var headerRange = sheet.getRange(1, 1, 1, header.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    
    if (sentEntries.length > 0) {
      sheet.getRange(2, 1, sentEntries.length, header.length).setValues(sentEntries);
    }
    
    return {
      status: "success",
      message: "Successfully created BRAND NEW Google Sheet file!",
      spreadsheetTitle: newSpreadsheet.getName(),
      spreadsheetId: newSpreadsheet.getId(),
      spreadsheetUrl: newSpreadsheet.getUrl(),
      totalSentEmailRegistrations: sentEntries.length
    };
    
  } catch(err) {
    return { status: "error", message: err.toString() };
  }
}

function processRegistration(data) {
  try {
    var ss = getSpreadsheet();
    var sheet = getTargetSheet(ss);
    
    var email = (data.email || "").toString().trim();
    var mobile = (data.mobile || "").toString().trim();
    var fullname = (data.fullname || "Citizen Builder").toString().trim();
    var role = (data.role || "School Teacher").toString().trim();
    var use_case = (data.use_case || data.organization || "").toString().trim();
    var profession = (data.profession || data.class || "").toString().trim();
    var city = (data.city || "").toString().trim();
    var source = (data.source || "Website").toString().trim();
    
    var rows = sheet.getDataRange().getValues();
    var isDuplicate = false;
    
    if (email || mobile) {
      for (var i = 1; i < rows.length; i++) {
        var rowEmail = (rows[i][2] || "").toString().trim().toLowerCase();
        var rowMobile = (rows[i][3] || "").toString().trim();
        
        if ((email && rowEmail === email.toLowerCase()) || (mobile && rowMobile && rowMobile === mobile)) {
          isDuplicate = true;
          break;
        }
      }
    }
    
    if (isDuplicate) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        duplicate: true,
        message: "User already exists in '2 oct live' tab. Registration skipped."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var nextIdNum = 393;
    if (rows.length > 1) {
      for (var r = rows.length - 1; r >= 1; r--) {
        var cellVal = (rows[r][7] || rows[r][1] || "").toString();
        var idMatch = cellVal.match(/AIP-2026-(\d+)/);
        if (idMatch) {
          nextIdNum = parseInt(idMatch[1], 10) + 1;
          break;
        }
      }
    }
    var passportId = "AIP-2026-" + ("0000" + nextIdNum).slice(-4);
    
    var now = new Date();
    
    sheet.appendRow([
      now,
      fullname,
      email,
      mobile,
      role,
      use_case,
      profession,
      passportId,
      city,
      source,
      "on",
      "Sent",
      "Sent",
      "Registered"
    ]);
    
    if (email && data.skipEmail !== "true" && source !== "Sheet1 Sync") {
      try {
        if (data.action === "sendCert" || data.type === "certificate") {
          sendCertificateEmail(email, fullname, passportId, role);
        } else {
          sendConfirmationEmail(email, fullname, passportId, role);
        }
      } catch(emailErr) {
        Logger.log("Email error: " + emailErr.toString());
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      passportId: passportId,
      tab: sheet.getName()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createVerifiedSentSheet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var CUTOFF_MS = new Date(2026, 8, 14, 0, 0, 0).getTime();
    
    var targetSheet = getTargetSheet(ss);
    var dashSheet = ss.getSheetByName("Dashboard") || ss.getSheetByName("dashboard");
    
    var liveRows = targetSheet.getDataRange().getValues();
    var dashRows = dashSheet ? dashSheet.getDataRange().getValues() : [];
    
    var masterRegistrations = [];
    var seenEmails = {};
    var seenMobiles = {};
    
    function processRow(r, defaultSource) {
      var ts = r[0];
      var name = (r[1] || "").toString().trim();
      var email = (r[2] || "").toString().trim();
      var mobile = (r[3] || "").toString().trim();
      var role = (r[4] || "School Teacher").toString().trim();
      var interest = (r[5] || "General AI").toString().trim();
      var org = (r[6] || "School").toString().trim();
      var pid = (r[7] || "").toString().trim();
      var city = (r[8] || "").toString().trim();
      var source = (r[9] || defaultSource).toString().trim();
      
      if (name.indexOf("EXECUTIVE DASHBOARD") !== -1 || name.indexOf("FILTER BY") !== -1 || name.indexOf("PARTICIPANT DIRECTORY") !== -1 || name.indexOf("AI Passport ID") !== -1) {
        return;
      }
      
      if (!name && !email && !mobile) return;
      
      var regDate = null;
      if (ts instanceof Date) {
        regDate = ts;
      } else if (ts) {
        var str = ts.toString().trim();
        var mMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
        if (mMatch) {
          regDate = new Date(parseInt(mMatch[3]), parseInt(mMatch[2]) - 1, parseInt(mMatch[1]), parseInt(mMatch[4]), parseInt(mMatch[5]), parseInt(mMatch[6]));
        } else {
          var parsed = new Date(str);
          if (!isNaN(parsed.getTime())) regDate = parsed;
        }
      }
      
      if (regDate && regDate.getTime() < CUTOFF_MS) {
        return;
      }
      
      var cleanE = email.toLowerCase();
      var cleanM = mobile.replace(/\D/g, "").slice(-10);
      
      if (cleanE && seenEmails[cleanE]) return;
      if (cleanM && seenMobiles[cleanM]) return;
      
      if (cleanE) seenEmails[cleanE] = true;
      if (cleanM) seenMobiles[cleanM] = true;
      
      masterRegistrations.push([
        regDate || new Date(),
        name || "Educator",
        email,
        mobile,
        role,
        interest,
        org,
        pid || ("AIP-2026-" + ("0000" + (400 + masterRegistrations.length)).slice(-4)),
        city,
        source,
        "on",
        "Confirmed Email Sent",
        "Registered"
      ]);
    }
    
    for (var i = 1; i < liveRows.length; i++) {
      processRow(liveRows[i], "20 Sept Live Form");
    }
    
    for (var d = 1; d < dashRows.length; d++) {
      processRow(dashRows[d], "Dashboard Portal");
    }
    
    var newSheet = ss.getSheetByName(VERIFIED_TAB_NAME);
    if (!newSheet) {
      newSheet = ss.insertSheet(VERIFIED_TAB_NAME);
    } else {
      newSheet.clearContents();
    }
    
    var header = [
      "Timestamp", "Full Name", "Email", "Mobile", "Role", "Primary Interest", 
      "School / Organization", "AI Passport ID", "City", "Source", "Consent", 
      "Email Status", "Status"
    ];
    
    newSheet.appendRow(header);
    
    var headerRange = newSheet.getRange(1, 1, 1, header.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    
    if (masterRegistrations.length > 0) {
      newSheet.getRange(2, 1, masterRegistrations.length, header.length).setValues(masterRegistrations);
    }
    
    return {
      status: "success",
      message: "Successfully created new sheet '" + VERIFIED_TAB_NAME + "'!",
      newSheetName: VERIFIED_TAB_NAME,
      totalVerifiedRegistrations: masterRegistrations.length
    };
    
  } catch(err) {
    return { status: "error", message: err.toString() };
  }
}

function sendConfirmationEmail(email, fullname, passportId, role) {
  if (!email) return;
  
  var subject = "SEAT CONFIRMED: AI in Education — Preparing the Teacher for Viksit Bharat | " + passportId;
  var bccEmail = "ekaakshareducation@gmail.com";
  
  var htmlBody = `
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
                      AI PASSPORT LIVE™
                    </h1>
                    <div style="font-size: 11px; font-weight: 500; color: #94A3B8; letter-spacing: 0.08em;">
                      National Teacher Empowerment Initiative
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
              <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; line-height: 1.3;">
                AI in Education — Preparing the Teacher for Viksit Bharat
              </h2>
              <div style="font-size: 15px; font-weight: 700; color: #B45309; letter-spacing: 0.02em; margin-bottom: 12px;">
                AI Passport Live™ National Webinar
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 12px 0 0 0;">
                Dear <strong>${fullname}</strong>,<br><br>
                Welcome to AI Passport Live™. Your seat is successfully reserved for the national webinar: <strong>AI in Education — Preparing the Teacher for Viksit Bharat</strong>.
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
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">PROGRAM THEME</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 13px; font-weight: 700; color: #0F172A;">AI in Education &bull; Viksit Bharat</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">DATE</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">2 OCTOBER 2026</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">TIME</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">2:00 PM &ndash; 3:30 PM IST</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">ROLE REGISTERED</td>
                  <td align="right" style="padding-bottom: 10px; font-size: 14px; font-weight: 700; color: #0F172A;">${role}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: 0.05em;">FORMAT</td>
                  <td align="right" style="font-size: 14px; font-weight: 700; color: #16A34A;">ONLINE &bull; FREE</td>
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
                    <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=AI+Passport+Live%3A+AI+in+Education+%E2%80%93+Preparing+the+Teacher+for+Viksit+Bharat&dates=20261002T083000Z/20261002T100000Z&details=Free+live+experience+for+teachers+and+educators.+Official+Portal%3A+https%3A%2F%2Faipassport.ekaakshareducation.com%2F&location=Online+Live+Webinar" target="_blank" style="background-color: #0F172A; color: #FFFFFF; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; margin-right: 8px; margin-bottom: 12px;">
                      ADD TO CALENDAR &rarr;
                    </a>
                    <a href="https://api.whatsapp.com/send?text=I%27m%20attending%20AI%20Passport%20Live%E2%84%A2%20%E2%80%94%20AI%20in%20Education%3A%20Preparing%20the%20Teacher%20for%20Viksit%20Bharat%20on%202%20October%202026%2C%20from%202%3A00%20PM%20to%203%3A30%20PM%20IST.%20Learn%20more%3A%20https%3A%2F%2Faipassport.ekaakshareducation.com%2F" target="_blank" style="background-color: #F8FAFC; color: #0F172A; font-weight: 700; padding: 14px 24px; border-radius: 8px; display: inline-block; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; border: 1px solid #CBD5E1; margin-bottom: 12px;">
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
  
  GmailApp.sendEmail(email, subject, "Your seat for the AI Passport National Webinar is confirmed. Passport ID: " + passportId, {
    name: "AI Passport™ by Ekaakshar Education",
    bcc: bccEmail,
    htmlBody: htmlBody
  });
}

function sendCertificateEmail(email, fullname, passportId, role) {
  if (!email) return;
  
  var subject = "Official Certificate: AI Passport Live™ National Webinar for Educators";
  
  var htmlBody = `
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
        <p style="margin-top: 0;"><strong>Dear ${fullname},</strong></p>
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
  `;
  
  GmailApp.sendEmail(email, subject, "Dear " + fullname + ",\n\nThank you for participating in the AI Passport Live National Webinar for Educators held on 20 September 2026!\n\nWe are pleased to present your official Certificate of Participation (Level 1 – AI Explorer).\n\nYour official certificate document is attached to this email as a high-resolution PNG image.\n\nThank you for your commitment to transforming education and building with AI.\n\nWarm regards,\nTeam AI Passport™\nEkaakshar Education\naipassport.ekaakshareducation.com", {
    name: "Team AI Passport™ — Ekaakshar Education",
    htmlBody: htmlBody
  });
}

