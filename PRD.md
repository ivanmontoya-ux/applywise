# App Plan - ApplyWise

## 1. App Overview

ApplyWise is a web app for graduates in Europe applying to skilled early-career roles. It helps them find relevant jobs, track every application, tailor CVs and cover letters with evidence-based AI, and keep deadlines and next actions visible. Validation so far taught us to keep the product broader than finance, let users explore before login, and require an account only when storing private information. The product promise is: find and track better job applications with less chaos.

For professor submission, ApplyWise should be evaluated as a working MVP concept with a clear target user, validation evidence, data plan, architecture, and risk-aware AI scope. Informal validation among friends and family was positive: everyone shown the concept liked the tool and understood why it could help graduates organize applications. All 7 group members also tested the application and made recommendations for improvement. An informal survey and feedback discussion with another class group showed that everyone in that group saw the need for the feature.

## 2. Key Components

- Public waitlist and landing page with privacy-first messaging.
- Supabase authentication with login, signup, logout, and demo-mode browsing.
- Jobs page with stored jobs, Adzuna refresh, filters for location, type, sector, date, and keyword search.
- AI job recommendations above the job list after the user saves Personal Information from a CV.
- Tracker with user-scoped applications and statuses: Saved, Applied, Interview, Assessment, Offer, Rejected, Withdrawn.
- Documents workspace for CV review, CV extraction, saved Personal Information, cover letters, and document export.
- Application-specific storage for generated cover letters and CV recommendations.
- Home dashboard showing next actions, reminders, application counts, and CV readiness.
- Coach workspace for job fit, CV improvement, cover letters, and next-step support.

## 3. App Structure

Public screens:

- Landing/Waitlist: captures interest and target-role context.
- Login and Sign Up: authenticate users without blocking feature discovery.

App screens:

- Home: shows the user's next best step.
- Jobs: browse roles, refresh job list, view AI recommendations, save jobs.
- Tracker: track saved applications by status.
- Documents: upload/paste CVs, extract profile information, generate CV recommendations and cover letters.
- Personal Information: view saved CV-derived profile data.
- Coach: ask for application-specific advice.
- Reminders: see deadlines, follow-ups, interview prep, missing documents, and weekly goals.

Navigation flow:

- Unauthenticated users can browse app screens in demo mode.
- Saving jobs, Personal Information, or application documents requires login.
- After login, users land on Home.
- Uploading or extracting a CV creates Personal Information, which unlocks AI job recommendations on Jobs.

## 4. User Interface

Use `DESIGN.md`: calm corporate, simple, organized, and private. Desktop uses a left sidebar and top auth bar. Mobile should collapse to a compact app layout without horizontal scroll.

Jobs page:

- Header with Jobs title, Add manual job, and Refresh list.
- Filter bar for location, type, sector, date, and search.
- AI recommendation band above job cards after CV-derived Personal Information exists.
- Job cards with role, company, location, sector, experience level, deadline, Save, Source, and Apply Direct actions.

Documents page:

- CV upload or paste area.
- Structured extraction result.
- Save to Personal Information action.
- CV review and cover letter generator tied to a selected application.
- Save generated output to the application and export cover letter as a document.

Tracker:

- Application cards show role, company, status, notes, document readiness, and saved AI material.
- Demo users see the feature but must log in to store data.

## 5. Backend Requirements

A backend is required because ApplyWise stores private CV information, applications, generated AI output, and authenticated user data.

Current implementation:

- React/Vite frontend in `client/`.
- Express API in `server/`.
- SQLite local database for jobs, tracker, waitlist, and Personal Information.
- Supabase Auth for authentication.
- Gemini API for CV review, CV extraction, cover letters, and job recommendations.
- Adzuna API for job import and refresh.

Production direction:

- Frontend hosted on Netlify.
- Backend hosted separately as a Node API unless moved to serverless functions.
- Supabase Auth remains the identity layer.
- Supabase Postgres should become the production system of record using the existing migrations.
- Every user-owned query must use authenticated `user_id`.
- Secrets stay on the backend; only Supabase publishable keys can be exposed to the frontend.

## 6. APIs and Libraries

- React, Vite, React Router, Axios, Lucide React, date-fns.
- Express for API routes.
- better-sqlite3 for local development persistence.
- Supabase Auth for signup, login, logout, and user session verification.
- Supabase Postgres and Storage for production data and private documents.
- Gemini API for structured AI outputs.
- Adzuna API for graduate and general business job listings.
- node-cron for daily job refresh automation.

## 7. Testing Strategy

Functional tests:

- User can browse app screens without login.
- User must log in before saving jobs, Personal Information, tracker data, or documents.
- Jobs load with filters and refresh through the backend.
- CV extraction saves a Personal Information profile.
- AI job recommendations appear only after saved Personal Information exists.
- CV recommendations and cover letters can be saved to the selected application.

Validation tests:

- 5-8 target graduates complete a prototype task with real or anonymized applications.
- AI outputs are reviewed for invented experience.
- Landing page smoke test runs through a Netlify URL.

Acceptance threshold:

- Zero invented candidate achievements in reviewed AI outputs.
- Users can add a job, save an application, extract CV data, and save one AI artifact without support.

## 8. Validation Reflection

The validation work taught us that ApplyWise should not be positioned as only another CV builder. The stronger value is the combined workflow: find jobs, save them, track each application, reuse CV-derived Personal Information, generate application-specific documents, and see the next best action.

Validation sources included friends-and-family feedback, internal prototype interviews/tests with all 7 group members, and an informal survey with another group from class. The overall reaction was positive, and the class-group feedback confirmed that students recognize the need for a better way to manage applications, CV work, cover letters, recommendations, and deadlines.

What changed after validation:

- **Jobs became broader:** Early feedback showed that a finance-only job feed was too narrow, so the job source and filters now include general business roles as well.
- **Access became easier:** Users can inspect the app in demo mode before logging in. This lowers friction during testing while still protecting private storage behind authentication.
- **Personal Information became central:** CV extraction now creates a reusable profile that can support job recommendations, CV suggestions, and cover letters.
- **AI outputs became application-specific:** Cover letters and CV recommendations can be saved to the related application, which keeps the workflow organized.
- **Recommendations became explainable:** AI job recommendations include a fit score, fit label, reason, evidence, and next step.
- **Deployment became important:** Local testing showed that localhost is confusing for non-technical users, so the frontend should be deployed through Netlify for review and validation.
- **Privacy stayed central:** Positive feedback does not remove the need for user-controlled saving, clear account boundaries, and user-scoped data access.
- **Internal testing led to improvements:** Group testing was useful because every member tried the app and turned feedback into product changes.

The strongest unresolved assumption is whether target graduates will enter real or anonymized CV and application data and return to update the tracker over time. The next validation round should focus on behavioral tests, not only positive comments.

## 9. Platform-Specific Considerations

Netlify will host the frontend from `client/dist`. Recommended build settings:

- Base directory: repository root.
- Build command: `npm run build --workspace=client`.
- Publish directory: `client/dist`.
- Frontend environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

The Express API must be deployed separately or converted to serverless endpoints before production. The frontend should call the deployed API URL instead of the local Vite proxy. Backend environment variables include `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, `ADZUNA_APP_ID`, and `ADZUNA_APP_KEY`.

## 10. Professor Submission Checklist

The submission package should include:

- `PRD.md`: updated product plan and validation reflection.
- `evidence/validation/validation-board.md`: assumptions tested, methods, learnings, and next validation tests.
- `evidence/validation/user-evidence.md`: friends/family validation, prototype signals, and evidence gaps.
- `ARCHITECTURE.md`: frontend, backend, database, AI, job ingestion, and automation diagram.
- `DATA_PLAN.md`: what data is needed, where it lives, and who can read or write it.
- `DESIGN.md`: visual system and UX rules.
- `Final_PRD.md`: original professor-facing product requirements document.

Submission narrative:

ApplyWise solves the scattered graduate job-search workflow by combining job discovery, application tracking, AI-assisted document preparation, reminders, and reusable Personal Information. Early informal validation was positive, especially among friends and family, who liked the tool and understood the need. The main learning was that the product should be broader than finance, easier to try before signup, and stricter about saving AI outputs inside the relevant application.

## 11. Out of Scope for v1

- Auto-applying to jobs.
- Guaranteed interview or offer claims.
- Browser extension job import.
- Email inbox sync.
- Calendar sync.
- Native iOS app.
- University admin dashboard.
- Recruiter-facing product.
- Direct email sending.
- Full interview-prep workspace beyond basic reminders.

## 12. Definition of Done

- A visitor can join the waitlist from the deployed frontend.
- A user can browse features before login.
- A logged-in user can save jobs and see them in Tracker.
- A logged-in user can upload or paste a CV, extract Personal Information, and save it.
- Jobs page shows AI job recommendations from the current job list after Personal Information exists.
- A user can generate and save CV recommendations or a cover letter to a specific application.
- Private user data is always scoped by authenticated `user_id`.
- No UI copy or AI output implies guaranteed job outcomes.
