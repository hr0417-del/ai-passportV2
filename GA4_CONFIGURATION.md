# ⚙️ GA4 CONFIGURATION, CUSTOM DIMENSIONS & REPORTING BLUEPRINT

**PROJECT:** AI Passport™ by Ekaakshar Education  
**WEBSITE:** [https://aipassport.ekaakshareducation.com/](https://aipassport.ekaakshareducation.com/)  
**GA4 MEASUREMENT ID:** `G-QQV0VX8N47`  

---

## 📌 1. GA4 CUSTOM DIMENSIONS PLAN

The following custom event-scoped dimensions should be registered in Google Analytics 4 under **Admin → Data Display → Custom definitions → Create custom dimensions**.

Only high-value, actionable parameters are recommended to keep your GA4 data clean and under quota limits.

| Dimension Name | Scope | Event Parameter | Why It Matters / Business Purpose |
| :--- | :--- | :--- | :--- |
| **Form Name** | Event | `form_name` | Identifies which form was interacted with (`webinar_registration`, `footer_newsletter`, etc.). |
| **Educator Role** | Event | `role` | Categorizes registrants by role (`School Teacher`, `Faculty`, `Principal`, `Academic Coordinator`). |
| **Primary AI Use Case** | Event | `use_case` | Identifies what educators want to build (`Lesson Planning`, `Content Creation`, `Assessment`). |
| **Registration Error Type** | Event | `error_type` | Pinpoints funnel friction (`validation_error`, `duplicate_user`, `server_error`). |
| **CTA Name** | Event | `cta_name` | Measures exact button copy that drove engagement (`REGISTER FREE`, `EXPLORE AI PASSPORT`). |
| **CTA Location** | Event | `cta_location` | Tracks where CTAs convert best (`hero_section`, `nav_header`, `webinar_section`, `final_cta`). |
| **Homepage Section ID** | Event | `section_id` | Tracks section reach (`hero`, `what_is_ai_passport`, `mastery_levels`, `ai_journey`, `proof_projects`). |
| **Homepage Section Name** | Event | `section_name` | Human-readable section label for content reporting. |
| **AI Journey Stage Name** | Event | `stage_name` | Tracks progression through the 5 capability levels (`EXPLORE`, `CREATE`, `INNOVATE`, `BUILD`, `LEAD`). |
| **AI Journey Stage Level** | Event | `stage_level` | Numeric level (1 to 5) for stage completion sequencing. |
| **Link / Action Type** | Event | `link_type` | Categorizes outbound actions (`whatsapp`, `email`, `phone`, `outbound`). |
| **Passport ID Generated** | Event | `passport_id_generated` | Confirms whether a digital ticket ID was generated upon registration. |

---

## ✅ 2. GA4 MANUAL ADMIN CHECKLIST

Complete these manual configuration steps in your Google Analytics 4 property:

| Check | Admin Task | Exact GA4 Navigation Path | Status |
| :---: | :--- | :--- | :---: |
| `[ ]` | **Mark `registration_success` as Key Event** | **Admin → Data Display → Key events** → Click *New key event* → Enter `registration_success` → Save | Pending |
| `[ ]` | **Create Custom Dimensions** | **Admin → Data Display → Custom definitions** → Click *Create custom dimension* → Register the 12 dimensions above | Pending |
| `[ ]` | **Build Webinar Funnel Exploration** | **Explore → Blank / Funnel exploration** → Add steps (`webinar_cta_click` → `form_start` → `form_submit` → `registration_success`) | Pending |
| `[ ]` | **Connect Google Search Console** | **Admin → Product links → Search Console links** → Click *Link* → Select Search Console property | Pending |
| `[ ]` | **Set UTM Naming Standards** | Document campaign naming conventions (e.g., `utm_source=meta&utm_medium=cpc&utm_campaign=viksit_bharat`) | Pending |
| `[ ]` | **Verify Realtime Stream** | **Reports → Realtime** → Open site in mobile/browser and verify active user count | **DONE** |
| `[ ]` | **Verify DebugView Stream** | **Admin → Data Display → DebugView** → Perform test actions and inspect event timeline | **DONE** |
| `[ ]` | **Verify Page View Deduplication** | Confirm exactly 1 `page_view` fires per page load (verified in production build) | **DONE** |
| `[ ]` | **Verify Privacy Protections** | Inspect event parameters to verify zero PII (email, phone, name) is transmitted | **DONE** |

---

## 📈 3. BUSINESS ANALYTICS MODEL (CORE REPORTING SPECIFICATIONS)

Build these 4 report views in Google Analytics 4 (using **Reports → Library** or **Explore**):

### 📊 REPORT 01: AI PASSPORT — EXECUTIVE OVERVIEW
* **Target Audience:** Executive & Leadership Team
* **Dimensions:** `Date`, `First user primary channel group`, `Device category`
* **Metrics:** `Active users`, `New users`, `Sessions`, `Engagement rate`, `Key events` (`registration_success`), `User key event rate`
* **Filters:** None (All website traffic)
* **Key Event Focus:** `registration_success`

### 📢 REPORT 02: TRAFFIC & CAMPAIGN ACQUISITION
* **Target Audience:** Growth & Marketing Team
* **Dimensions:** `Session source / medium`, `Session campaign`, `Landing page + query string`
* **Metrics:** `Sessions`, `Engaged sessions`, `Engagement rate`, `Event count` (`webinar_cta_click`), `Key events` (`registration_success`), `Session key event rate`
* **Filters:** None
* **Key Event Focus:** `registration_success` by Campaign & Source

### 🗺 REPORT 03: CONTENT & JOURNEY ENGAGEMENT
* **Target Audience:** Product & Content Optimization Team
* **Dimensions:** `Custom: Homepage Section ID`, `Custom: AI Journey Stage Name`, `Custom: CTA Name`, `Custom: CTA Location`
* **Metrics:** `Event count` (`section_view`), `Event count` (`journey_stage_view`), `Event count` (`cta_click`), `Total users`
* **Filters:** Event name matches `section_view` OR `journey_stage_view` OR `cta_click`
* **Key Event Focus:** Section reach & 5-Stage Journey progression

### 🎯 REPORT 04: WEBINAR CONVERSION FUNNEL & FRICTION
* **Target Audience:** Conversion Rate Optimization (CRO) Team
* **Funnel Steps:**
  1. `webinar_cta_click` (Webinar CTA Click)
  2. `form_start` (Registration Form Start)
  3. `form_submit` (Registration Form Submitted)
  4. `registration_success` (Confirmed Registration Success)
* **Breakdown Dimensions:** `Custom: Educator Role`, `Custom: Primary AI Use Case`, `Custom: Registration Error Type`, `Session source / medium`
* **Metrics:** `Step completion rate`, `Abandonment rate`, `Friction errors` (`registration_error`)
* **Filters:** Webinar funnel events
