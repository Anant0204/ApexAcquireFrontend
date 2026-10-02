# Business Requirements

## 1. Project Overview
**Client:** EM Home Buyers / Momentum Capital (Dallas–Fort Worth, Texas)
**System:** Realtor Outreach and Acquisition CRM (APEXACQUIRE)
**Objective:** A purpose-built web application to manage a large list of real estate agents in a permanent, automated email and SMS cadence. The system uses AI to handle SMS conversations upon agent reply, captures property addresses, and funnels them into a pipeline for the human acquisitions team.

## 2. Target Audience & Workflows
- Designed exclusively for the **Acquisitions Department**.
- Focuses on a single workflow: **Agent outreach to deal acquisition**.

## 3. Core Success Criteria
- **Bulk Import:** Agent contacts loaded via CSV; searchable records with normalized email and phone data.
- **Unattended Outreach:** Email and SMS cadences run on an automated schedule (e.g., every 30 days) without manual triggers.
- **AI-Driven Responses:** Inbound SMS replies are met with contextual AI responses. Entire conversations are stored on the contact record.
- **Automated Deal Creation:** Property addresses offered by agents are captured and converted into deals in a round-robin assigned pipeline.
- **Conversation Grading:** Every conversation is graded (A-D) based on specific criteria to prioritize human attention.
- **Mobile Accessibility:** Any team member can log in via mobile (PWA), review conversations, claim leads, and reply manually.

## 4. Non-functional Requirements
- **Performance:** Handle 250,000 contacts and 25 concurrent users seamlessly. List views of 100,000 contacts must load in under 3 seconds.
- **Resilience:** External integration failures (e.g., Twilio) must gracefully degrade, keeping the rest of the app functional.
- **Idempotency:** Message dispatch must be idempotent to prevent duplicate sending.
- **Security:** TLS in transit, encryption at rest for sensitive data. Daily backups with tested restore capabilities. Field-level audit trail for all changes.
- **Configuration over Code:** Business rules (cadences, routing, grading) must be adjustable via UI configuration, not hard-coded.

## 5. Compliance
- **10DLC Registration:** Mandatory for production SMS.
- **Opt-Out Handling:** Immediate honoring of STOP/UNSUBSCRIBE keywords.
- **Time Zone Restrictions:** Outreach limited to permitted sending hours.
- **Email Authentication:** SPF, DKIM, and DMARC enforcement. Unsubscribe link and physical address required on all emails.
