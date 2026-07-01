# ApplyWise UI Prototype

This folder contains a static responsive UI prototype based on `Final_PRD.md` and `DESIGN.md`.

Open `index.html` in a browser to review:

- Waitlist landing preview
- Supabase-backed waitlist signup flow with beta context fields, duplicate email handling, stored demo entries, and a small waitlist dashboard
- Home dashboard
- Jobs search and manual add flow
- Tracker with desktop kanban and mobile status filters
- Application detail
- Documents
- Coach
- Reminders

The prototype uses local HTML, CSS, and JavaScript only. Waitlist entries are sent to Supabase when `ui-prototype/supabase-config.js` is configured, then mirrored in the browser's local storage for demo purposes. It is not connected to email delivery or AI functions.

Copy `ui-prototype/supabase-config.example.js` to `ui-prototype/supabase-config.js` and add the Supabase Project URL and publishable key. The real config file is ignored by git.
