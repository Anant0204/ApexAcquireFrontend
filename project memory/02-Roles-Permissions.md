# Roles and Permissions (RBAC)

Access control must be rigorously enforced on both the server/API layer and the frontend interface. Soft deletes are used, and deactivated users' histories are retained, with their open leads reassigned.

## 1. Admin (2 Seats)
**Full System Access**
- Manage users, roles, and integration credentials (Twilio/Telnyx, Email, LLM providers).
- Configure cadence settings, AI persona instructions, grading criteria, and thresholds.
- Create and edit templates (Email, SMS, Contract Documents).
- Access all reports and audit logs.
- Perform all actions available to Managers and Agents.

## 2. Manager (1 Seat)
**Team and Pipeline Oversight**
- Full access to contacts, campaigns, and pipeline actions.
- Ability to reassign leads and deals among agents.
- View system settings and configurations (cannot edit integration credentials).
- Monitor task queues and Manager escalations.

## 3. Agent (4 Seats)
**Daily Operations**
- Work assigned leads and deals.
- Claim unassigned leads from the general queue.
- Reply manually in conversations (triggering AI pause).
- Move owned deals between pipeline stages.
- Utilize click-to-call functionality and log manual calls/notes.

## 4. Read-Only (2 Seats)
**Observation and Auditing**
- View contacts, conversations, pipelines, and reporting dashboards.
- No editing capabilities.
- Cannot initiate outreach, claim deals, or modify settings.
