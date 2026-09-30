# ⚙️ GA4 AUTOMATION & MANUAL ADMIN ACTION BLUEPRINT

**PROJECT:** AI Passport™ by Ekaakshar Education  
**WEBSITE:** [https://aipassport.ekaakshareducation.com/](https://aipassport.ekaakshareducation.com/)  
**MEASUREMENT ID:** `G-QQV0VX8N47`  

---

## 📌 1. EXECUTIVE GA4 SUMMARY

| Category | Status | Details |
| :--- | :---: | :--- |
| **Frontend Code Integration** | ✅ **100% AUTOMATED** | Central analytics service (`src/lib/analytics.js`), standard tag, PII sanitizer, campaign attribution, non-blocking observers, and form funnel triggers deployed to production. |
| **Production Event Stream** | ✅ **LIVE & VERIFIED** | Hits arriving in GA4 property `G-QQV0VX8N47` (verified via Realtime & DebugView). |
| **GA4 Admin Console Settings** | ⚠️ **MANUAL ACTION REQUIRED** | GA4 Admin configuration requires logging into the Google Analytics UI. Follow the click-by-click guide below. |

---

## 🔑 2. STEP-BY-STEP GA4 ADMIN CONFIGURATION GUIDE

### ACTION 01: MARK `registration_success` AS PRIMARY KEY EVENT (CONVERSION)

* **Exact Navigation Path:**  
  `GA4 Left Sidebar` → `Admin ⚙️ (bottom left gear)` → `Data Display` → `Key events`
* **Exact Click Sequence:**
  1. Click **Admin ⚙️** (bottom-left gear icon).
  2. Under *Data Display*, click **Key events**.
  3. Click the blue **New key event** button (top right).
  4. In the *Event name* field, type **EXACTLY**:
     ```
     registration_success
     ```
  5. Click **Save**.
* **Result:** GA4 will mark `registration_success` as your primary conversion target and calculate conversion rates across all traffic channels.

---

### ACTION 02: CREATE THE CUSTOM DIMENSIONS (VERIFIED CREATED IN GA4)

* **Exact Navigation Path:**  
  `GA4 Left Sidebar` → `Admin ⚙️` → `Data Display` → `Custom definitions`
* **Status:** ✅ **VERIFIED CREATED IN GA4 UI**

The following custom definitions are active in your GA4 property:

| # | Dimension Name | Scope | Event Parameter | Status |
| :-: | :--- | :---: | :--- | :---: |
| **1** | `AI Journey Stage Name` | Event | `stage_name` | ✅ Active |
| **2** | `CTA Name` | Event | `cta_name` | ✅ Active |
| **3** | `Educator Role` | Event | `role` | ✅ Active |
| **4** | `Form Name` | Event | `form_name` | ✅ Active |
| **5** | `Homepage Section ID` | Event | `section_id` | ✅ Active |
| **6** | `Link_Action Type` | Event | `link_type` | ✅ Active |
| **7** | `Passport ID Generated` | Event | `passport_id_generated` | ✅ Active |
| **8** | `Primary AI Use Case` | Event | `use_case` | ✅ Active |
| **9** | `Registration Error Type` | Event | `error_type` | ✅ Active |

---

### ACTION 03: CREATE THE WEBINAR FUNNEL EXPLORATION

* **Exact Navigation Path:**  
  `GA4 Left Sidebar` → `Explore 🔍` → `Funnel exploration` (or `Blank`)
* **Exact Click Sequence:**
  1. Click **Explore 🔍** in the left menu.
  2. Select **Funnel exploration**.
  3. Under *Tab Settings → Steps*, click the edit pencil ✏️ next to **Steps**.
  4. Configure the 4 sequential steps exactly as follows:
     * **Step 1:** Name: `Webinar CTA Click` | Condition: Event = `webinar_cta_click`
     * **Step 2:** Name: `Form Start` | Condition: Event = `form_start` (is followed by Step 1)
     * **Step 3:** Name: `Form Submit` | Condition: Event = `form_submit` (is followed by Step 2)
     * **Step 4:** Name: `Registration Success` | Condition: Event = `registration_success` (is followed by Step 3)
  5. Click **Apply** (top right).
  6. Under *Breakdown*, drag **Educator Role** or **Session source / medium**.
* **Result:** Renders a 4-step conversion funnel showing exact drop-off rates and completion percentages.

---

### ACTION 04: CONNECT GOOGLE SEARCH CONSOLE

* **Exact Navigation Path:**  
  `Admin ⚙️` → `Product links` → `Search Console links`
* **Exact Click Sequence:**
  1. Click **Admin ⚙️**.
  2. Under *Product links*, click **Search Console links**.
  3. Click the blue **Link** button (top right).
  4. Click **Choose accounts** and select your Search Console property for `aipassport.ekaakshareducation.com`.
  5. Select your Web Data Stream (`G-QQV0VX8N47`).
  6. Click **Submit**.

---

## 📈 3. BUSINESS ANALYTICS MODEL (4 CORE REPORTS)

### 📊 REPORT 01: EXECUTIVE OVERVIEW
* **Navigation:** `Reports → Library → Create new report → Detail report`
* **Primary Dimensions:** `Date`, `First user primary channel group`, `Device category`
* **Metrics:** `Active users`, `Sessions`, `Engagement rate`, `Key events` (`registration_success`), `User key event rate`
* **Filters:** None

### 📢 REPORT 02: TRAFFIC & CAMPAIGN ACQUISITION
* **Navigation:** `Reports → Acquisition → Traffic acquisition`
* **Primary Dimensions:** `Session source / medium`, `Session campaign`, `Landing page + query string`
* **Metrics:** `Sessions`, `Engaged sessions`, `Engagement rate`, `Event count` (`webinar_cta_click`), `Key events` (`registration_success`), `Session key event rate`

### 🗺 REPORT 03: CONTENT & AI JOURNEY ENGAGEMENT
* **Navigation:** `Explore 🔍 → Free form`
* **Primary Dimensions:** `Custom: Homepage Section ID`, `Custom: AI Journey Stage Name`, `Custom: CTA Name`, `Custom: CTA Location`
* **Metrics:** `Event count` (`section_view`), `Event count` (`journey_stage_view`), `Event count` (`cta_click`), `Total users`

### 🎯 REPORT 04: WEBINAR FUNNEL & FRICTION DIAGNOSTIC
* **Navigation:** `Explore 🔍 → Funnel exploration`
* **Funnel Steps:** `webinar_cta_click` → `form_start` → `form_submit` → `registration_success`
* **Breakdown Dimensions:** `Custom: Educator Role`, `Custom: Primary AI Use Case`, `Custom: Registration Error Type`
* **Metrics:** `Completion rate`, `Abandonment rate`, `Friction errors` (`registration_error`)
