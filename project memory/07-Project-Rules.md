# Project Rules & Configurations

## 1. Cadence & Outreach Rules
- **Initial Touch:** Day-0 Email & SMS immediately upon enrollment.
- **Recurring Touch:** Next message in sequence every 30 days from last touch.
- **Reply Reset:** Any inbound reply resets the 30-day clock.
- **Permanent Enrollment:** Contacts never age out. They enter a 30-Day Nurture loop post-sequence.
- **Exits:** 'Opted Out' (STOP) and 'Declined' (confirmed not-interested).
- **Deal Suspension:** Automated cadence pauses if a deal is active. Returns to cadence when deal is terminal.

## 2. Conversation Grading & Classification
- **Grade A (90-100):** Captured address, price, and timeline. High intent.
- **Grade B (70-89):** Engaged, property mentioned, but missing some criteria.
- **Grade C (40-69):** Questions, hesitation, requires human clarification.
- **Grade D (0-39):** Unresponsive or borderline decline.
- *AI Classification:* Determines intent (interested, has property, wants call). Updates lead 'Temperature' (Hot, Warm, Cold).

## 3. Queues & Escalations
- **Leads with Address:** AI captures an address -> Deal created -> Assigned via Round Robin.
- **Needs Human:** AI cannot progress, agent asks for human, or consecutive AI reply limit reached -> Assigned via Round Robin -> System pauses AI.
