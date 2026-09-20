// ==========================================================================
// MY AI PASSPORT™ — GOOGLE APPS SCRIPT WEB APP (v4.9 - NEW SPREADSHEET CREATOR)
// Active Spreadsheet ID: 1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto
// Tab Target: "20 sept live" & "20 Sept Verified Sent"
// ==========================================================================

var SPREADSHEET_ID = "1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto";
var TAB_NAME = "20 sept live";
var VERIFIED_TAB_NAME = "20 Sept Verified Sent";

function getTargetSheet(ss) {
  var sheet = ss.getSheetByName(TAB_NAME) || 
              ss.getSheetByName("20 Sept Live") || 
              ss.getSheetByName("20 sept Live") || 
              ss.getSheets()[0];
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
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
        message: "User already exists in '20 sept live' tab. Registration skipped."
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
        sendConfirmationEmail(email, fullname, passportId, role);
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
