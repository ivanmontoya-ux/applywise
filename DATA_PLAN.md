# ApplyWise Data Plan

Date: 2026-07-03

## Purpose

ApplyWise stores private job-search data: CV-derived personal information, applications, notes, generated documents, and reminders. The data plan must keep user data scoped to the authenticated user, avoid exposing secrets, and make AI usage clear.

For professor submission, the key data argument is that ApplyWise cannot work well without storing some private career data, but the product must collect only what is needed and keep every user-owned record tied to the authenticated `user_id`.

## Data Stores

| Store | Current State | Production Direction | Data Held |
|---|---|---|---|
| Supabase Auth | Active | Keep | User identity, email, access tokens, refresh tokens. |
| SQLite `server/db/jobs.db` | Active local development store | Replace or mirror with Supabase Postgres for production | Jobs, tracker, waitlist, Personal Information. |
| Supabase Postgres | Migrations exist | Production system of record | Profiles, jobs, applications, reminders, documents, AI artifacts, Personal Information, waitlist. |
| Supabase Storage | Migration prepared | Private document file storage | CVs, cover letters, uploaded documents. |
| Gemini API | Active through backend | Keep behind backend | Temporary AI request context and generated output. |
| Adzuna API | Active through backend | Keep behind backend | External job listings and metadata. |
| Browser local storage | Active for auth session only | Keep minimal | Supabase session object only. |

## Data Classes

| Data Class | Examples | Sensitivity | Read Access | Write Access |
|---|---|---|---|---|
| Public job data | Title, company, location, sector, description, source URL | Low to medium | Anonymous and authenticated users | Backend import, authenticated manual creation |
| Waitlist data | Email, name, location, target role, strongest need, consent | Medium | Admin/backend only | Anonymous insert through waitlist form |
| Auth data | User id, email, session tokens | High | User and Supabase Auth | Supabase Auth |
| Application tracker data | Saved jobs, statuses, notes, deadlines, source URLs | High | Owning user only | Owning user only |
| Personal Information | CV-extracted profile, contact, education, experience, skills | High | Owning user only | Owning user only |
| Documents | CV text, cover letters, CV suggestions, exported document content | High | Owning user only | Owning user only |
| AI artifacts | CV review JSON, cover letter JSON, recommendation output | High | Owning user only | Owning user only |
| Reminders and goals | Follow-ups, deadlines, interview prep, weekly goals | Medium to high | Owning user only | Owning user only |
| Operational logs | API errors, refresh status, job import counts | Low to medium | Developers/admins | Backend |

## Current Local Tables

| Table | Purpose | Key Fields | Access Rule |
|---|---|---|---|
| `jobs` | Stored job listings from Adzuna, seed data, or manual creation | `id`, `title`, `company`, `location`, `sector`, `description`, `url`, `source`, `created_by` | Public jobs are readable; user-created jobs should be readable by owner. |
| `tracker` | User application tracker | `user_id`, `job_id`, `title`, `company`, `status`, `notes`, `cv_review_json`, `cover_letter_json` | Must always filter by authenticated `user_id`. |
| `waitlist_signups` | Waitlist capture | `email`, `full_name`, `location`, `target_role`, `strongest_need`, `consent` | Public insert only; do not expose signup list publicly. |
| `personal_information` | Saved CV-derived profile | `user_id`, `candidate_name`, `summary`, JSON profile sections | Must always filter by authenticated `user_id`. |

## Production Supabase Tables

The migrations under `supabase/migrations/` define the production direction:

- `profiles`
- `waitlist_signups`
- `jobs`
- `applications`
- `reminders`
- `documents`
- `ai_artifacts`
- `document_suggestions`
- `application_activity`
- `weekly_goals`
- `personal_information`

Every user-owned table must have row-level security enabled and policies that require `auth.uid() = user_id`.

## AI Data Flow

AI inputs:

- CV text or uploaded CV content.
- Saved Personal Information.
- Job title, company, description, sector, and location.
- Application notes where relevant.

AI outputs:

- CV review and fit analysis.
- Extracted Personal Information.
- Cover letter draft.
- Job recommendations from the current job list.

Rules:

- Do not send unrelated user data to Gemini.
- Do not include secrets in prompts.
- Do not ask AI to guess missing candidate facts.
- Store AI output only when the user explicitly saves it or when the feature requires saved Personal Information.
- Display AI output as editable, user-approved material.

## Read And Write Rules

Anonymous users:

- Can view public app screens.
- Can browse public jobs in demo mode.
- Can join the waitlist.
- Cannot save jobs, tracker records, Personal Information, or documents.

Authenticated users:

- Can read public jobs.
- Can create and read their own manual jobs where supported.
- Can create, read, update, and delete their own tracker records.
- Can create, read, update, and delete their own Personal Information.
- Can save AI output to their own applications.
- Cannot read or write another user's private data.

Backend:

- Can call Adzuna and Gemini using server environment variables.
- Can verify Supabase tokens.
- Must scope user-owned operations to `req.user.id`.

Frontend:

- May use Supabase publishable keys.
- Must not contain Gemini keys, Adzuna keys, Supabase service-role keys, or database credentials.

## Retention And Deletion

Recommended policy:

- Waitlist data: keep until converted, unsubscribed, or deleted by request.
- Application data: keep while account is active.
- Personal Information and documents: delete immediately when user deletes the profile/document or account.
- AI artifacts: delete with the linked application or user account.
- Job listings: prune stale external jobs after 30 days unless saved in a user application.
- Logs: keep only what is needed for debugging and security, with no raw CV text in logs.

## GDPR-Oriented Requirements

- Explain why CV and Personal Information are stored.
- Ask for consent before waitlist contact.
- Provide account deletion.
- Provide user data export before public launch.
- Keep private document storage non-public.
- Use data minimization: only request the CV/application details needed for the selected feature.
- Avoid opaque automation: ApplyWise does not apply to jobs on behalf of users.

## Open Decisions

- Whether production data moves fully from SQLite to Supabase Postgres before beta.
- Whether uploaded CV files are stored, or only extracted text is stored in v1.
- Whether AI request/response logs are stored for debugging; if yes, they need redaction and retention limits.
- Who has admin access to waitlist and support data.

## Validation Impact On Data Plan

Friends and family validation showed that people liked the idea of a single organized job-search workspace. The data plan reflects what that feedback taught us:

- The app needs a reusable Personal Information record because users should not have to re-enter CV details for every AI feature.
- AI output should be stored under the specific application so the user can find the generated cover letter or CV recommendation later.
- Demo-mode browsing is useful, but saving private information must require an authenticated account.
- Job recommendations should use saved user data only when the user has chosen to store it.
- Privacy and trust should be visible in the product because CVs, applications, and career notes are sensitive.
