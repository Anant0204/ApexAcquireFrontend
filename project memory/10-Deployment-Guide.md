# Deployment Guide

## Infrastructure
- **Frontend Hosting:** Vercel or AWS Amplify (Optimized for React/Vite SPAs).
- **Backend API:** AWS ECS or Render (Node.js/Python), providing highly available worker instances for CRON jobs.
- **Database:** Managed PostgreSQL (e.g., Supabase or AWS RDS) with automated daily backups and point-in-time recovery.

## 3rd Party Integrations
- **SMS & Voice:** Twilio or Telnyx. Requires 10DLC registration before production.
- **Email:** SendGrid, Mailgun, or AWS SES. Must configure SPF, DKIM, and DMARC for `emhomebuyer.com`.
- **AI/LLM:** OpenAI API or Anthropic API (for conversation parsing and responses).

## 10DLC Compliance Steps (Crucial)
1. Register EM Home Buyers as a Brand via The Campaign Registry (TCR).
2. Register a "Marketing / Mixed" Campaign.
3. Provide explicit explanations of the opt-out mechanisms (STOP keyword handling).
4. As contacts are cold, document the business justification clearly to prevent campaign rejection. Have a fallback pool of numbers if limits are heavily restricted initially.
