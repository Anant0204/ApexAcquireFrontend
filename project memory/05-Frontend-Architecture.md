# Frontend Architecture

## Tech Stack
- **Framework:** React / TypeScript / Vite (or Next.js)
- **Styling:** Tailwind CSS with custom theme variables.
- **Icons:** Lucide React
- **State Management:** React Context (AppContext) for Global User, Tasks, Notifications.

## Layout & Routing Structure
- `AppShell`: Persistent Sidebar (collapsible) and Header (Search, Notifications). Role Switcher is handled at the `/login` screen.
- **Routing Engine:** `react-router-dom` using dynamic role-based nested routes (`/:role/*`).
- **Routes:**
  1. `/:role/dashboard` - Metrics, Queue summaries, Performance.
  2. `/:role/outreach` - Kanban/List of contacts in the 5-Touch and Nurture sequences.
  3. `/:role/deals` - AI Deals and Manual Deals pipelines (Kanban boards).
  4. `/:role/conversations` - Omnichannel Inbox, split by AI Active vs Needs Human.
  5. `/:role/tasks` - Centralized Task Manager.
  6. `/:role/contacts` - Master CRM directory, Data tables.
  7. `/:role/templates` - Workflow, Email, SMS, Contract template editors.
  8. `/:role/reports` - Telemetry, Audit Logs.
  9. `/:role/settings` - AI Persona, Throttles, System settings.

## PWA Capabilities
- Responsive design tailored for mobile (stacking kanban boards).
- Service worker for offline caching of basic assets (optional phase 2).
