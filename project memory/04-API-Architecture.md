# API & Backend Architecture

## Core Services
1. **Outreach Engine (Cron/Worker)**
   - Responsible for querying contacts eligible for Touch 1 through 5, and the 30-Day Nurture.
   - Respects 24-hour rate limits and daily DND schedules.
   - Dispatches payloads to SMS and Email service abstractions.

2. **Communication Webhooks**
   - Ingests inbound SMS via Twilio/Telnyx.
   - Ingests inbound Email replies (parsed).
   - Validates incoming numbers against contacts, creating interactions.

3. **AI Classification & Conversation Agent**
   - Invokes LLM (OpenAI/Anthropic) with full context thread.
   - Goals: Classify Intent, Extract Data (Address, Price, Condition, Timeline), Generate Reply.
   - Logic limits: Checks consecutive AI replies; suspends AI if threshold reached, assigns to 'Needs Human Touch'.

4. **Deal & Round Robin Assigner**
   - Evaluates active agents based on assignment configuration.
   - Distributes newly captured properties from the AI to Agent users.

5. **Document Generation Service**
   - Parses Word/PDF contract templates.
   - Merges Deal and Property metadata.
   - Outputs finalized PDFs attached to the deal record.

## Security & Rate Limiting
- RESTful API secured by JWT authentication.
- Field-level RBAC middleware enforcing view/edit permissions.
- Idempotent API endpoints for dispatching sequences to prevent double-charging or double-sending.
