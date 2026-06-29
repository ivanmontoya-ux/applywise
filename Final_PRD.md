# Product Requirements Document - ApplyWise

## Professor Rubric Summary

### Problem Statement

Recent graduates in Europe applying for early-career skilled roles must manage job opportunities, deadlines, documents, interviews, and follow-ups across job boards, company career pages, spreadsheets, email, calendars, university portals, and generic AI tools. Because these workflows are scattered, they lose track of application status and next actions, miss deadlines or follow-ups, and spend too much time on administration instead of improving the quality of each application.

### Target User

The v1 target user is a recent bachelor's or master's graduate in Europe, within 24 months of graduation, who is actively applying to skilled early-career roles in business, tech, finance, consulting, marketing, or operations. They are usually managing 10+ applications at once using spreadsheets, job boards, Google Docs, email, calendars, and generic AI tools.

### Value Proposition

ApplyWise gives graduate job seekers one private command center for saving roles, tracking applications, managing deadlines, tailoring documents with evidence-based AI, and seeing the next best action for each opportunity. The product reduces job-search chaos and helps users produce more specific, truthful application materials without fabricating experience.

### MVP Scope

The MVP is a private web app where a user can manually add or save a job, track application status and deadlines, add notes and reminders, paste CV text, receive AI-powered job-fit and CV suggestions, generate an editable cover letter, and see next actions on a simple Home dashboard. Reliable PDF/DOCX extraction, full document versioning, interview prep, outreach tracking, external job APIs, browser extensions, inbox sync, calendar sync, and university dashboards are outside the P0 MVP.

### Why AI Is Necessary

A non-AI tracker can store applications and reminders, but it cannot reliably turn unstructured job descriptions and CV text into role requirements, evidence gaps, tailored CV suggestions, and job-specific cover letters. ApplyWise uses AI only where unstructured text understanding and personalization are required; tracking, reminders, statuses, storage, and user approvals remain deterministic product features.

### Submission Files

- `Final_PRD.md`: professor-facing product requirements document.
- `DESIGN.md`: visual language, components, microcopy, layout rules, and antipatterns.
- `ARCHITECTURE.md`: standalone architecture sketch showing frontend, backend, database, storage, AI, and automation.

## 0. Confirmed Decisions And Remaining Assumptions

This PRD is based on `AGENTS.md`, `Problems.md`, `PROBLEM_STATEMENT.md`, and `DESIGN.md`.

Confirmed decisions:

- **Brand casing:** The product name is `ApplyWise`.
- **Audience:** The long-term target audience is graduates in Europe, not only Master's in Management students.
- **v1 beachhead:** The first practical user segment is recent bachelor's or master's graduates within 24 months of graduation who are actively managing 10+ skilled early-career applications.
- **Focus 1:** The first product focus is job finding and application tracking.
- **Email outreach:** If outreach is included after the P0 MVP, it drafts and tracks outreach only. It does not send emails from inside ApplyWise.

Remaining assumptions:

- **50+ applications claim:** `Problems.md` says finding a skilled position often requires more than 50 applications before receiving an offer. Treat this as a founder-observed hypothesis, not a verified market statistic, until validated with user research or a reliable source.
- **Job discovery scope:** Full job-board aggregation is a major product in itself. For v1, job discovery will use manually seeded jobs plus user-created jobs; no external job API is required for the first build.
- **First launch target:** The first launch target is a private beta with graduate users before public launch or paid monetization.

## 1. App Overview

ApplyWise is a web app for graduates in Europe who are applying for skilled roles. The product helps users organize the job search around two first-order workflows: finding relevant job postings and tracking every application from saved role to final outcome. Around that core, the P0 MVP supports CV and cover letter tailoring plus reminders; P1 can expand into interview preparation and outreach drafting.

In v1, skilled roles exclude hourly, gig, retail, hospitality, and unqualified temporary work unless the user manually adds them.

The central problem is fragmentation. Graduates currently move between LinkedIn, Indeed, company career pages, university portals, spreadsheets, calendars, email inboxes, notes apps, and AI writing tools. This creates missed deadlines, repeated document work, weak follow-up discipline, and unnecessary stress. ApplyWise should become the user's job-search command center: a calm, structured system that shows what to apply for, what needs action, and how to make each application stronger.

The product should feel like a practical career coach combined with a productivity tool. It should be professional, supportive, and direct. It should not promise job offers, fabricate experience, or encourage users to mass-apply without thought.

Primary promise:

> Apply to better-fit roles with stronger materials and less chaos.

## 2. Target Users

### Primary Persona: Graduate Job Seeker

- Age range: roughly 21-30.
- Location: Europe.
- Education: bachelor's, master's, or comparable graduate-level qualification.
- Current situation: finishing studies or recently graduated and applying for skilled roles.
- v1 context: actively managing at least 10 open, saved, or planned applications.
- Target roles: business analyst, junior consultant, finance analyst, marketing associate, product/business operations, graduate schemes, graduate-level strategy roles, and early-career tech/business roles.
- Main pain: applying to many roles while keeping documents, deadlines, interviews, and follow-ups organized.
- Current tools: LinkedIn, company career pages, spreadsheets, Google Docs, ChatGPT, email, calendar, university portal.

For v1, "graduates" means users who finished or will finish a bachelor's or master's degree within the last 24 months and are applying for business, tech, finance, consulting, marketing, or operations roles in Europe. "All graduates" remains the broader strategic audience; it should not dilute the first build or the professor-facing problem statement.

### Founder Context Persona: Master's In Management Student

- The founding pain comes from Master's in Management students approaching graduation.
- This group is a strong research cohort because they are actively applying and understand the administrative burden.
- They should inform early validation, but they are not the only target segment.

### User Jobs To Be Done

- When I find a role, I want to save it with the job description and deadline so I can act on it later.
- When I decide whether to apply, I want to understand whether my background fits the role.
- When I apply, I want my CV and cover letter to reflect the job requirements without inventing experience.
- When I have many applications open, I want to know exactly what stage each one is in.
- When a deadline, interview, assessment, or follow-up is approaching, I want a clear reminder.
- When I get an interview, I want preparation based on the actual job and the documents I submitted.
- When I contact recruiters or alumni, I want to draft professional messages and track follow-ups.

## 3. Problem Definition

The job application process for graduates is no longer a single task. It is a high-volume workflow across disconnected systems.

The main problems from `Problems.md` are:

- **Fragmented job search process:** Users switch between job boards, company sites, emails, spreadsheets, calendars, and AI tools.
- **Poor application tracking:** Users forget where they applied, which status each application is in, and when follow-up is required.
- **Missed deadlines and opportunities:** Deadlines, interview dates, assessment links, and recruiter follow-ups are easy to lose.
- **Time-consuming job discovery:** Relevant roles are scattered across different platforms.
- **Repetitive CV and cover letter customization:** Each role needs tailored materials, but the work is slow and repetitive.
- **Weak interview preparation:** Generic interview advice is not enough because users need role-specific preparation.
- **Disorganized recruiter communication:** Outreach and follow-up messages are spread across email and LinkedIn.
- **No centralized application management:** Existing tools solve isolated parts, but not the full application journey.
- **Administrative overload:** Users spend too much time organizing the search and too little time improving application quality.
- **Stress and uncertainty:** High application volume and unclear progress reduce motivation and increase mistakes.

ApplyWise should reduce the operational load of applying while improving the quality and consistency of each application.

## 4. Product Goals

### v1 Goals

- Help graduates find relevant job postings and decide which ones are worth saving.
- Give users one private place to store job opportunities, application status, deadlines, next actions, documents, reminders, and notes.
- Make application tracking faster and clearer than a spreadsheet.
- Help users tailor CVs and cover letters to each job using truthful, user-approved suggestions.
- Show users the next best action for each active application.
- Prove that AI can improve application quality by extracting job requirements, comparing them with candidate evidence, and generating editable materials.
- Collect waitlist interest before public launch.

A job is considered relevant when it matches at least one target role, one target location or remote preference, and one selected industry from the user's onboarding profile.

### Non-Goals For v1

- Do not auto-apply to jobs.
- Do not claim to guarantee interviews or offers.
- Do not send emails from the user's inbox.
- Do not scrape job boards without a compliant data strategy.
- Do not build university dashboards or recruiter portals.
- Do not build native iOS in v1.
- Do not use fabricated success metrics or invented market statistics.

## 5. Success Metrics

Do not display these as fake product metrics in UI. These are internal measures for validation.

### Primary MVP Success Metric

Activation success: at least 60% of beta users create three tracked applications, add a deadline or next action to each, and generate at least one AI-assisted CV suggestion or cover letter within their first week.

This metric combines the three promises the MVP must prove: tracking applications, knowing the next action, and using AI to improve application quality.

### Secondary KPIs

The success of ApplyWise's MVP will also be measured using the following KPIs:

For KPI reporting, "users" means onboarded beta users who have saved at least one job.

- 70% of users track at least 10 applications.
- Users return to the platform at least twice per week.
- Users generate at least one AI-assisted CV or cover letter.
- 80% of reminders are completed before their deadline.
- Users report spending less time managing applications compared to spreadsheets.
- Net Promoter Score (NPS) above 30 during beta testing.

Early beta activation metrics:

- Waitlist conversion rate from landing page visitors.
- Percentage of onboarded users who save at least one job.
- Percentage of saved jobs that become tracked applications.
- Number of applications created per active user.
- Percentage of applications with at least one linked document.
- Percentage of applications with a reminder or next action.
- Percentage of users who return within 7 days.
- User-reported reduction in missed deadlines or lost application information.
- Qualitative feedback: users say they feel more organized and know what to do next.

## 6. Scope And Prioritization

### P0: Feasible MVP Vertical Slice

- Waitlist landing page.
- User authentication.
- Basic onboarding: name, location, graduation date, target roles, target industries, target locations, and work model.
- Manual job creation from pasted job description and source URL.
- Optional small team-seeded job list for demo purposes.
- Job detail page with source URL, deadline, company, location, work model, and description.
- Save job action that creates an application in `Saved` status.
- Application tracker with one primary view: list or simple kanban, not both initially.
- Application detail page with status, deadline, next action, notes, source URL, and reminders.
- Home dashboard showing active applications, upcoming deadlines, and next actions.
- Basic reminders displayed inside Home and Application Detail; no external email or calendar notifications.
- CV text input: paste CV text first.
- Optional private CV file upload if the build platform can extract or store files reliably without delaying the core workflow.
- AI job requirements extraction from pasted job descriptions.
- AI CV fit analysis with evidence gaps and unsupported-claim flags.
- AI editable cover letter generation for one selected application.
- Privacy-first storage using Supabase row-level security.

### P1: Should Build After P0 Works

- Full Documents page with versioning.
- Reliable PDF/DOCX text extraction.
- Interview prep workspace.
- Outreach draft helper and manual outreach log.
- Second tracker view if only one view ships in P0.
- Advanced application search and filters.
- External job API integration.
- Email reminder notifications.
- Better job-fit scoring with transparent reasons.
- CSV export of applications.
- Saved outreach contacts.
- More structured interview question practice.
- Basic analytics about applications by status, industry, and response pattern.

### P2: Later

- Direct Gmail/Outlook sending.
- Browser extension for importing jobs.
- Native iOS app.
- University admin dashboard.
- Paid subscription checkout.
- Recruiter-facing product.
- Multi-language support.
- Video interview practice.

## 7. Core User Journey

### Journey A: First-Time User

1. User lands on ApplyWise and understands that the product organizes the graduate job search.
2. User joins the waitlist or creates an account if access is open.
3. User completes onboarding:
   - Name.
   - Country/city.
   - Graduation date.
   - Target industries.
   - Target role types.
   - Work model preference.
   - Optional pasted CV text or CV upload.
4. User reaches Home.
5. Home prompts the user to save a first target job, add CV text, or create a weekly application goal.

### Journey B: Save And Track A Job

1. User searches jobs or manually adds a job.
2. User opens Job Detail.
3. User reviews title, company, location, industry, description, deadline, and source URL.
4. User saves the job.
5. ApplyWise creates an application in `Saved` status.
6. User sees the job in Tracker and Application Detail.
7. User adds deadline, notes, and next action.

### Journey C: Tailor Documents

1. User opens an Application Detail page.
2. User selects `Review CV` or `Generate Cover Letter`.
3. ApplyWise parses job requirements:
   - Required skills.
   - Preferred skills.
   - Responsibilities.
   - Keywords.
   - Application instructions.
4. ApplyWise compares the job to the user's CV or profile data.
5. ApplyWise returns:
   - Strong matches.
   - Missing evidence.
   - Risks or unsupported claims.
   - Suggested CV edits.
6. User approves or rejects suggestions.
7. User generates a cover letter with selected tone.
8. Cover letter is saved and linked to the application.

### Journey D: Manage Progress

1. User moves an application from `Saved` to `Applied`.
2. User records submission date and documents used.
3. User creates a follow-up reminder.
4. Home shows next actions and deadlines.
5. User receives clear prompts for assessment, interview, offer, rejection, or withdrawal.

### Journey E: Prepare For Interview (P1, Not Required For P0 MVP)

1. User moves application to `Interview` or `Assessment`.
2. ApplyWise creates an interview prep workspace tied to the application.
3. User sees:
   - Job requirements summary.
   - Submitted CV/cover letter summary.
   - Likely behavioral questions.
   - Role-specific prep prompts.
   - Company research notes field.
4. User saves notes and marks prep tasks complete.

### Journey F: Outreach Tracking (P1, Not Required For P0 MVP)

1. User opens Application Detail or Coach.
2. User selects `Draft Outreach`.
3. User chooses contact type:
   - Recruiter.
   - Alumni.
   - Hiring manager.
   - Employee referral.
   - Follow-up after application.
4. ApplyWise drafts a specific, professional message.
5. User copies the message to email or LinkedIn.
6. User logs the outreach date, contact name, channel, and follow-up reminder.

## 8. App Structure

### Public Screens

- **Landing Page:** Explains the problem, product promise, privacy stance, and waitlist signup.
- **Waitlist Confirmation:** Confirms submission and sets expectation for early access.
- **Auth:** Sign up, sign in, password reset or magic link.

### Authenticated Screens

- **Onboarding:** Collects profile, preferences, and optional CV.
- **Home:** Shows next actions, reminders, active applications, suggested jobs, and coach prompt.
- **Jobs:** Search and browse stored jobs. Add manual job.
- **Job Detail:** Shows job information and actions to save, assess fit, tailor documents, or create application.
- **Tracker:** Pipeline view of applications by status.
- **Application Detail:** Single source of truth for one application.
- **Documents:** In P0, base CV text and generated cover letters; in P1, full document versioning and upload management.
- **Coach:** In P0, job fit, CV improvement, cover letter drafting, and next-step support; in P1, interview prep and outreach drafts.
- **Reminders:** Calendar/list view of deadlines, follow-ups, interviews, and missing documents.
- **Settings:** Profile, preferences, privacy, data export, and account deletion.

### Navigation

Desktop:

- Left sidebar: Home, Jobs, Tracker, Documents, Coach, Reminders.
- Top-right: profile menu and settings.
- Main content: current workspace.
- Optional right panel: next action, coach suggestion, or application context.

Mobile:

- Bottom tabs: Home, Jobs, Tracker, Documents, Coach.
- Reminders and Settings accessible from Home or profile.
- Tracker uses segmented status tabs instead of wide kanban columns.

## 9. Detailed Functional Requirements

### 9.1 Landing Page And Waitlist

Requirements:

- Show clear headline focused on job finding and application tracking.
- Explain the problem of fragmented job applications.
- Show 4-5 core benefits:
  - Find relevant jobs.
  - Track every application.
  - Tailor CV and cover letters.
  - Manage deadlines and next actions.
  - Keep follow-ups visible.
- Include email input and `Join Waitlist` CTA.
- Store waitlist email with timestamp and source.
- Prevent duplicate waitlist signups by email.
- Show privacy reassurance near the form.

Acceptance criteria:

- Visitor can submit email in under 30 seconds.
- Duplicate email does not create duplicate rows.
- Empty or invalid email shows inline error.

### 9.2 Authentication And Onboarding

Requirements:

- Users can sign up with email/password or magic link.
- New users complete onboarding before Home.
- Onboarding collects:
  - Full name.
  - Current country and city.
  - Graduation date.
  - Degree/program.
  - Target industries.
  - Target roles.
  - Target locations.
  - Work model preference.
  - Weekly application goal.
  - Optional pasted CV text or CV upload.
- Users can skip CV input but Home should prompt them later.

Acceptance criteria:

- Returning users bypass onboarding after completion.
- Preferences can be edited later in Settings.
- Pasted CV text and uploaded CV files are stored privately.

### 9.3 Job Finding And Job Saving

v1 job finding uses manually seeded jobs plus user-created jobs. ApplyWise will not scrape external sites or require a job API in the first build.

A job is relevant when it matches at least one target role, one target location or remote preference, and one selected industry from the user's onboarding profile.

Requirements:

- Users can search stored jobs by title, company, and keyword.
- Users can filter jobs by industry, location, work model, role type, deadline, and experience level.
- Users can manually add a job by entering role title, company, location, source URL, deadline, industry, work model, and pasted job description.
- When a user adds a job by URL, ApplyWise stores the URL but does not scrape the page.
- Saving a job creates an application in `Saved` status.
- If the same user saves a job with the same source URL twice, ApplyWise opens the existing application instead of creating a duplicate.
- Job Detail shows the original job description, source URL, deadline, and a generated requirements summary.
- CV tailoring and cover letter generation are blocked until the job has enough description text.

Critical constraint:

- If external job listings are used after v1, the data source must be compliant with the provider's terms. Do not assume scraping is allowed.

Acceptance criteria:

- User can search by title or company and filter results without page reload.
- User can manually create a job in under 2 minutes.
- Saved jobs appear immediately in Tracker as `Saved`.
- Duplicate source URLs do not create duplicate applications.
- Missing job descriptions trigger a clear prompt to paste the description.

### 9.4 Application Tracker

Statuses:

- Saved
- Applied
- Interview
- Assessment
- Offer
- Rejected
- Withdrawn

Requirements:

- User can move applications between statuses.
- Application cards show:
  - Company.
  - Role.
  - Status.
  - Deadline or next action date.
  - Reminder indicator.
  - Document readiness indicator.
- Application Detail stores:
  - Status.
  - Applied date.
  - Deadline.
  - Next action.
  - Notes.
  - Source URL.
  - Linked CV.
  - Linked cover letter.
  - Interview notes, if P1 interview prep is enabled.
  - Outreach records, if P1 outreach tracking is enabled.
- P0 ships one primary tracker view: list or simple kanban. The second view moves to P1 unless it is trivial after the first is working.
- Users may move applications between any statuses, but every status change must create an activity timeline entry with timestamp and previous status.
- An inactive application is any non-terminal application without a next action or reminder due date.
- Document readiness means the application has either a linked CV, linked cover letter, or both, shown as Missing, Partial, or Complete.

Acceptance criteria:

- Status changes save immediately.
- User can filter applications by status.
- User can find inactive applications with no next action.
- No application can be linked to another user's data.
- Application status changes appear in the activity timeline immediately after saving.

### 9.5 Documents

Document types:

- Base CV.
- Tailored CV suggestion.
- Cover letter.
- Interview notes.
- Outreach draft.

Requirements:

- P0 stores user-approved CV text for AI use. Users can paste CV text manually.
- PDF or DOCX upload is optional for P0 and must not block the core workflow.
- If file upload is implemented, uploaded CV files must be stored privately.
- If automatic text extraction is implemented, extracted text must be shown to the user before being used for AI generation.
- If CV text extraction fails, the user must be prompted to paste CV text manually before CV tailoring can run.
- User can view document metadata:
  - Title.
  - Type.
  - Linked application.
  - Version.
  - Created date.
  - Updated date.
- User can generate cover letters from Application Detail.
- User can edit generated text before using it.
- P0 must save generated cover letters and approved CV suggestions to the related application.
- Full job-specific document versioning is P1.

Privacy requirement:

- Uploaded CV files must be stored in a private bucket and served only through authenticated access.

Acceptance criteria:

- User can paste CV text and link it to their profile or an application.
- If upload is built, user can upload and link a CV to an application.
- User can create a cover letter linked to one application.
- User can identify which document version belongs to which application.
- Unsupported file types show an inline error and are not uploaded.

### 9.6 CV Tailoring

Requirements:

- Input must include:
  - Job description.
  - Selected CV or profile text.
  - Target role/company.
- ApplyWise should output:
  - Job Requirements Map.
  - Fit Assessment.
  - Strong matches.
  - Weak or missing evidence.
  - Risky or unsupported claims.
  - Suggested profile/summary rewrite.
  - Suggested bullet rewrites.
  - Suggested skills grouping.
- Suggestions must be user-approved.
- The system must not invent experience, achievements, metrics, certificates, languages, or qualifications.

Acceptance criteria:

- If CV is missing, the app asks user to upload or paste CV content.
- If job description is missing, the app asks user to add it.
- Tailoring output separates confirmed evidence from assumptions.
- User can save approved suggestions as a document version.

### 9.7 Cover Letter Generator

Requirements:

- User selects:
  - Application.
  - Tone: formal, confident, warm, concise, or custom.
  - Length: short, standard, detailed.
  - Optional personal motivation notes.
- Generated cover letter must:
  - Name the role and company.
  - Connect 2-3 candidate evidence points to job requirements.
  - Avoid generic claims.
  - Avoid unsupported exaggeration.
  - Stay editable.
- Default length: 250-350 words.
- A cover letter is considered job-specific only if it includes the company name, role title, and at least two job requirements matched to candidate evidence.

Acceptance criteria:

- Cover letter cannot be generated without a job and candidate evidence.
- Generated letter is specific to the role and company.
- User can edit and save the letter.
- Generated letter is linked to the application.

### 9.8 Reminders And Next Actions

Reminder types:

P0:

- Application deadline.
- Follow-up.
- Assessment.
- Missing documents.
- Weekly application goal.

P1:

- Interview prep.
- Outreach follow-up.

Requirements:

- User can create reminders from Application Detail.
- System suggests reminders based on status transitions.
- Home shows due and upcoming reminders.
- Completed reminders can be marked done.
- Overdue reminders remain visible until resolved.
- Default P0 reminder suggestions are follow-up seven days after `Applied` and deadline reminder two days before application deadline.
- P1 adds interview prep reminders two days before an interview or assessment.

Acceptance criteria:

- Moving to `Applied` prompts a follow-up reminder suggestion.
- Moving to `Interview` prompts an interview prep reminder only if P1 interview prep is enabled.
- Applications with no next action are flagged.

### 9.9 Coach

Requirements:

- Coach supports task-specific modes:
  - Check Job Fit.
  - Improve CV.
  - Draft Cover Letter.
  - What Should I Do Next?
- P1 Coach modes:
  - Prepare Interview.
  - Draft Outreach.
- Coach should use selected application context when available.
- Coach must ask for missing context instead of giving generic advice.
- Coach must not guarantee outcomes or fabricate candidate experience.

Acceptance criteria:

- User can ask Coach about a specific application.
- Coach references job requirements and linked documents.
- Coach distinguishes confirmed facts from assumptions.
- Coach output can be saved as notes or document draft.

### 9.10 Interview Preparation (P1, Not Required For P0 MVP)

Requirements:

- Interview prep is linked to Application Detail.
- User can generate:
  - Job requirement recap.
  - Likely behavioral questions.
  - Role-specific questions.
  - Candidate evidence prompts.
  - Company research checklist.
  - Questions to ask interviewer.
- Prep should reference submitted CV and cover letter where available.

Acceptance criteria:

- User can generate prep from an application in `Interview` or `Assessment`.
- Prep includes job-specific content, not generic interview tips only.
- User can save notes under the application.

### 9.11 Outreach Drafting And Tracking (P1, Not Required For P0 MVP)

P1 scope: draft and track outreach manually. No direct email sending.

Requirements:

- User can create outreach record linked to an application or company.
- Outreach fields:
  - Contact name.
  - Contact role.
  - Company.
  - Channel: email, LinkedIn, university network, other.
  - Message type: cold outreach, recruiter follow-up, alumni request, thank-you note, referral request.
  - Draft message.
  - Sent date.
  - Follow-up date.
  - Response status.
- Coach can draft professional outreach messages.
- Outreach response status must be one of Drafted, Sent, Replied, Follow-up Needed, Closed, or No Response.

Acceptance criteria:

- User can draft and copy an outreach message.
- User can log when it was sent.
- User can create follow-up reminder.
- App does not send email in P1.

## 10. User Interface Requirements

Follow `DESIGN.md`: clean corporate, simple, approachable, calm, private, no fake metrics.

### Landing Page

Hero:

- Left-aligned or asymmetric layout.
- Headline: "Find and track better job applications with less chaos" or revised equivalent.
- Subheadline explains centralization of jobs, applications, documents, reminders, and next actions.
- Waitlist email field with one primary CTA.
- Product preview should show tracker, job detail, and reminders.

Sections:

- Problem: scattered job search across many tools.
- Product workflow: find, save, tailor, track, prepare, follow up.
- Privacy message.
- Waitlist CTA.

Avoid:

- Fake statistics.
- "Guaranteed job" language.
- 3 equal generic feature cards.

### Home

Layout:

- Main "Today" panel with next actions.
- Upcoming deadlines and reminders.
- Active applications list.
- Suggested jobs or saved jobs without next action.
- Coach prompt tied to the user's current bottleneck.

Required states:

- Empty state for new user.
- State with overdue tasks.
- State with upcoming interview.
- State with missing CV.

### Jobs

Layout:

- Search bar.
- Filter row.
- Job cards.
- Manual add button.
- Save action.
- Deadline and location metadata.

Job Detail:

- Job description.
- Requirement summary.
- Fit helper.
- Save/create application.
- Tailor CV and cover letter actions once saved.

### Tracker

P0 requirement:

- Ship one primary tracker view first: either compact list or simple kanban.
- If both views are not built, the missing view moves to P1.

Desktop:

- If kanban is chosen, show one column per status.
- Cards are compact and scannable.

Mobile:

- Segmented status selector.
- Stacked cards.

Application card:

- Role.
- Company.
- Deadline/next action.
- Status.
- Linked document indicator.
- Reminder indicator.

### Application Detail

Sections:

- Header: role, company, status selector.
- Next action.
- Key dates.
- Documents.
- Reminders.
- Notes.
- Interview prep preview or placeholder only if P1 work has started.
- Outreach log preview or placeholder only if P1 work has started.
- Activity timeline.

Primary actions:

- Review CV.
- Generate Cover Letter.
- Add Reminder.
- Update Status.

### Documents

Layout:

- P0: pasted base CV text, approved CV suggestions, and generated cover letters.
- P1: uploaded CVs and full versioning.
- Job-specific CV suggestions.
- Cover letters.
- Filters by document type and application.
- Version labels.

### Coach

Layout:

- Serious writing workspace, not playful chatbot.
- Context selector at top: no application selected, or current application.
- Starter buttons for task-specific modes.
- Output actions: save to notes, save as document, create reminder.

P0 starter buttons:

- Check Job Fit.
- Improve CV.
- Draft Cover Letter.
- What Should I Do Next?

P1 starter buttons:

- Prepare Interview.
- Draft Outreach.

### Initial Wireframe Sketches

These sketches are intentionally simple so the professor can see the first product shape without needing a full visual prototype.

Home:

```text
+--------------------------------------------------+
| Today                                            |
| - Follow up: BCG Graduate Consultant             |
| - Finish cover letter: Revolut Analyst           |
| - Add deadline: Deloitte Graduate Scheme         |
+----------------------+---------------------------+
| Upcoming Deadlines   | Active Applications       |
| Fri - Deloitte       | Saved: 4                  |
| Mon - Spotify        | Applied: 7                |
|                      | Interview: 2              |
+----------------------+---------------------------+
```

Application Detail:

```text
+--------------------------------------------------+
| Junior Consultant - Bain             [Status: Applied]
+--------------------------------------------------+
| Next Action: Follow up by June 30                |
| Key Dates | Documents | Reminders | Notes        |
| AI Panel: CV fit gaps + cover letter draft       |
| Activity Timeline                                |
+--------------------------------------------------+
```

Tracker:

```text
Saved          Applied        Interview      Rejected
------------- -------------  -------------  -------------
Role card     Role card      Role card      Role card
Role card     Role card
```

## 11. Backend Requirements

Backend required because ApplyWise stores private candidate data, CV text or files, generated documents, applications, reminders, and later outreach records.

Recommended stack for Lovable:

- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase Edge Functions for AI calls.
- Row-level security on every user-owned table.

### Initial Architecture Sketch

```text
User
 |
 v
React / Tailwind Frontend
- Landing page
- Auth and onboarding
- Home dashboard
- Jobs / Add Job
- Tracker
- Application Detail
- CV / Cover Letter AI panel
 |
 v
Supabase Backend
 |
 +--> Supabase Auth
 |    - Email/password or magic link
 |    - User sessions
 |
 +--> Supabase Postgres
 |    - users
 |    - user_preferences
 |    - jobs
 |    - applications
 |    - application_events
 |    - documents
 |    - reminders
 |    - cv_suggestions
 |    - cover_letters
 |
 +--> Supabase Storage
 |    - Private CV uploads if file upload ships
 |    - Private generated documents if stored as files
 |
 +--> Supabase Edge Functions
      |
      +--> AI Provider API
           - analyze_job_fit
           - suggest_cv_edits
           - generate_cover_letter
```

Main data flow:

1. User signs up and completes onboarding.
2. User manually adds a job by pasting a job description and source URL, or saves a team-seeded job.
3. Frontend saves the job to Supabase Postgres.
4. Saving the job creates an application in `Saved` status.
5. User pastes CV text or optionally uploads a CV file.
6. Frontend calls a Supabase Edge Function with job description, CV/profile text, and selected AI task.
7. Edge Function calls the AI provider and receives structured JSON.
8. Frontend displays requirements, fit assessment, evidence gaps, risk flags, and suggested text.
9. User approves, edits, or rejects AI output.
10. Approved output is saved as a document, CV suggestion, cover letter, or note.

Automation rules:

- Saving a job automatically creates an application in `Saved` status.
- Changing application status creates an `application_events` timeline entry.
- Moving an application to `Applied` suggests a follow-up reminder.
- Moving an application to `Interview` suggests an interview-prep reminder only if P1 interview prep is enabled.
- Overdue reminders stay visible on Home until completed.
- No auto-apply, scraping, email sending, inbox sync, or calendar sync in P0.

The fuller architecture note lives in `ARCHITECTURE.md`.

### Database Schema

Schema implementation rule: Every schema field must be marked required or optional before implementation, and every enum field must list allowed values.

Enum values:

- `application.status`: Saved, Applied, Interview, Assessment, Offer, Rejected, Withdrawn.
- `documents.type`: base_cv, tailored_cv_suggestion, cover_letter, interview_notes, outreach_draft.
- `jobs.work_model`: onsite, hybrid, remote, flexible.
- `jobs.experience_level`: internship, graduate_scheme, entry_level, associate, other.
- `application_events.event_type`: created, status_changed, reminder_created, document_linked, note_added.
- `cover_letters.tone`: formal, confident, warm, concise, custom.
- `cover_letters.length`: short, standard, detailed.
- `cv_suggestions.approval_status`: draft, approved, rejected.
- `cover_letters.approval_status`: draft, approved, rejected.
- `reminders.type`: application_deadline, follow_up, interview_prep, assessment, missing_documents, weekly_application_goal, outreach_follow_up.
- `coach_messages.mode`: check_job_fit, improve_cv, draft_cover_letter, prepare_interview, draft_outreach, next_step.
- `outreach_records.channel`: email, linkedin, university_network, other.
- `outreach_records.message_type`: cold_outreach, recruiter_follow_up, alumni_request, thank_you_note, referral_request.
- `outreach_records.response_status`: Drafted, Sent, Replied, Follow-up Needed, Closed, No Response.

#### users

- id - required
- email - required
- full_name - optional
- country - optional
- city - optional
- degree_program - optional
- graduation_date - optional
- onboarding_completed - required, default `false`
- created_at - required
- updated_at - required

#### user_preferences

- id - required
- user_id - required
- target_industries - required after onboarding
- target_roles - required after onboarding
- target_locations - required after onboarding
- work_model_preference - required after onboarding
- weekly_application_goal - optional
- created_at - required
- updated_at - required

#### waitlist_signups

- id - required
- email - required
- source - optional
- created_at - required

#### jobs

- id - required
- title - required
- company - required
- location - optional
- country - optional
- industry - optional
- work_model - optional
- experience_level - optional
- description - optional, but required before AI tailoring or cover letter generation
- source_url - optional
- deadline - optional
- external_id - optional
- source_name - optional
- created_by_user_id - optional for seeded jobs, required for user-created jobs
- created_at - required
- updated_at - required

#### applications

- id - required
- user_id - required
- job_id - required
- status - required
- applied_at - optional
- deadline - optional
- next_action - optional
- next_action_due_at - optional
- fit_notes - optional
- private_notes - optional
- rejection_reason - optional
- created_at - required
- updated_at - required

#### application_events

- id - required
- user_id - required
- application_id - required
- event_type - required
- previous_status - optional, required for `status_changed`
- new_status - optional, required for `status_changed`
- note - optional
- created_at - required

#### documents

- id - required
- user_id - required
- application_id - optional
- type - required
- title - required
- file_url - optional
- text_content - optional, required for AI tasks using the document
- version - required, default `1`
- source_document_id - optional
- created_at - required
- updated_at - required

#### cv_suggestions

- id - required
- user_id - required
- application_id - required
- source_document_id - optional
- job_requirements_summary - required
- fit_assessment - required
- suggested_summary - optional
- suggested_bullets - optional
- suggested_skills - optional
- missing_evidence - required, can be an empty list
- risk_flags - required, can be an empty list
- approval_status - required, default `draft`
- created_at - required
- updated_at - required

#### cover_letters

- id - required
- user_id - required
- application_id - required
- tone - required
- length - required
- content - required
- approval_status - required, default `draft`
- created_at - required
- updated_at - required

#### reminders

- id - required
- user_id - required
- application_id - optional
- type - required
- title - required
- due_at - required
- completed_at - optional
- created_at - required
- updated_at - required

#### coach_messages

- id - required
- user_id - required
- application_id - optional
- mode - required
- role - required
- content - required
- created_at - required

#### outreach_records (P1)

- id - required
- user_id - required
- application_id - optional
- contact_name - optional
- contact_role - optional
- company - optional
- channel - required
- message_type - required
- draft_message - optional
- sent_at - optional
- follow_up_at - optional
- response_status - required, default `Drafted`
- notes - optional
- created_at - required
- updated_at - required

#### interview_preps (P1)

- id - required
- user_id - required
- application_id - required
- requirements_recap - optional
- likely_questions - optional
- candidate_evidence_prompts - optional
- company_research_notes - optional
- questions_to_ask - optional
- created_at - required
- updated_at - required

### Security And Privacy

- Every user-owned table must include `user_id`.
- Enable row-level security before launch.
- Users can only read, create, update, or delete their own rows.
- CV files must live in private Supabase Storage buckets.
- AI functions receive only the minimum data needed for the task.
- Do not log full CVs, cover letters, or personal details in debug logs.
- Provide account deletion and data export path.
- State clearly that user data is private and not shared.
- Because v1 targets European users, follow GDPR-oriented principles: clear consent for storing CV/application data, authenticated access only, data export, account deletion, and minimization of personal data sent to AI services.
- Account deletion must delete or anonymize all user-owned applications, documents, reminders, outreach records, coach messages, and private storage files within the same deletion flow.

## 12. APIs And Integrations

### Required For v1

- **Supabase Auth:** email/password or magic link.
- **Supabase Storage:** private CV and document files if file upload ships in P0.
- **AI text API through server-side function:** job requirement extraction, CV fit analysis, CV suggestions, and cover letters.
- **Email service for waitlist confirmation only:** optional if Lovable/Supabase setup supports it.

All AI generation must run through a Supabase Edge Function that receives structured inputs and returns structured JSON; the browser must never call the AI provider directly.

### Optional Or Later

- **Job data API:** only after choosing a compliant source.
- **Email sending integration:** later, after privacy and consent design.
- **Calendar integration:** later for interview and deadline sync.
- **LinkedIn integration:** do not assume this is available or allowed.

## 13. Data Inputs

ApplyWise uses the following current or planned user-provided data:

- Job descriptions.
- CV text or CV files.
- Cover letters.
- User profile information.
- Application status.
- Interview dates, if P1 interview prep is enabled.
- Reminder dates.
- Recruiter contact information, if P1 outreach tracking is enabled.
- Outreach notes, if P1 outreach tracking is enabled.
- User preferences.

Decision for v1: ApplyWise stores user-approved CV text for AI use. Users may paste CV text manually, and optional CV file upload can be added if it does not delay the core workflow. If automatic extraction is implemented, extracted text must be shown to the user before being used for AI generation. Full CV files are stored privately; AI functions receive only the text needed for the selected task.

AI-generated outputs are always based on user-provided information and remain editable before being saved.

## 14. AI Behavior Requirements

AI is central to ApplyWise, but it must be controlled.

### Why AI Is Necessary

ApplyWise has two layers:

1. Non-AI workflow layer:
   - Application tracking.
   - Deadline and reminder management.
   - Notes and document storage.
   - Status history.
   - Dashboard and next actions.
2. AI assistance layer:
   - Extract job requirements from unstructured job descriptions.
   - Compare those requirements against the user's CV/profile text.
   - Identify strong evidence, missing evidence, and risky unsupported claims.
   - Suggest truthful CV edits tied to the job.
   - Generate editable cover letters based on actual candidate evidence.

The product would still be useful as a tracker without AI, but it would not solve the most repetitive and high-value part of the graduate job search: turning each job description into specific, truthful, tailored application materials. Therefore, AI is necessary for ApplyWise's differentiated value proposition, while core tracking remains deterministic and user-controlled.

Rules:

- AI must never fabricate candidate experience.
- AI must distinguish confirmed facts from missing evidence.
- AI must ask for missing information before generating final documents.
- AI must explain why each CV suggestion improves fit.
- AI must avoid generic cover letters.
- AI must not guarantee outcomes.
- AI must not encourage spam outreach.
- AI must keep tone professional and supportive.
- AI must preserve user control: suggestions are editable and user-approved.

Prompt inputs should include:

- Job description.
- Candidate CV/profile text.
- Application status.
- Relevant notes.
- Selected tone.
- User constraints.

Prompt outputs should be structured so the UI can show:

- Requirements.
- Fit assessment.
- Suggestions.
- Risks.
- Draft text.
- Questions for the user.

AI responses must return JSON with keys for `requirements`, `fit_assessment`, `evidence_gaps`, `risk_flags`, `suggested_text`, and `user_questions`.

## 15. Testing Strategy

### Unit Tests

- Application status transitions save allowed statuses only.
- Reminder creation requires type and due date.
- Job saving creates or links application correctly.
- CV tailoring requires selected job and CV/profile text.
- Cover letter generation requires application context.
- RLS policies deny access to another user's applications and documents.
- P1: outreach record creates follow-up reminder when follow-up date is present.

### Integration Tests

- User signs up, completes onboarding, pastes or uploads CV text, saves job, and sees it in Tracker.
- User manually creates a job, adds deadline, and receives Home reminder.
- User generates CV suggestions from a saved job and saves approved version.
- User generates cover letter and sees it under Documents and Application Detail.
- User deletes account and private records/files are removed or marked for deletion according to policy.
- P1: user moves application to `Interview` and generates interview prep.
- P1: user drafts outreach, copies message, logs sent date, and creates follow-up reminder.

### User Acceptance Tests

- A new user can join the waitlist in under 30 seconds.
- A signed-in user can save or manually create a job in under 2 minutes.
- A user can understand their next three actions from Home without opening every application.
- A user can tell which CV and cover letter belong to a specific application.
- A user cannot access private data from another account.
- P1: a user can prepare for an interview using the job description and submitted documents.
- P1: a user can track outreach without connecting their email account.

### Manual QA Checklist

- Mobile layouts have no horizontal overflow.
- Tracker is usable with all seven statuses.
- Empty states guide users to the next useful action.
- Error messages are specific and calm.
- Generated content is editable.
- Private file URLs are not public.
- No UI copy promises guaranteed interviews or offers.

## 16. Platform-Specific Considerations For Lovable

Build order in Lovable:

1. Create Supabase project and schema.
2. Add RLS policies before building user-facing private data flows.
3. Build waitlist landing page.
4. Build auth and onboarding.
5. Build app shell and Home.
6. Build Jobs and manual job creation.
7. Build Tracker and Application Detail.
8. Build CV text input, optional upload, generated documents, and cover letter saving.
9. Add AI functions for CV suggestions and cover letters.
10. Add reminders.
11. P1: add interview prep and outreach draft helpers after the P0 loop works.

Lovable instructions:

- Use React/Tailwind with the style rules in `DESIGN.md`.
- Keep components compact and product-like.
- Avoid invented metrics in dashboard previews.
- Use Supabase generated types where available.
- Keep AI calls server-side.
- Do not expose API keys in browser code.
- Make every private query scoped to the signed-in user.
- Use clear loading skeletons instead of spinners.

## 17. Edge Cases

- User saves the same job twice.
- Job has no deadline.
- Job posting disappears after being saved.
- User uploads unsupported file type.
- CV text extraction fails.
- User has no CV but asks for tailoring.
- User has no job description but asks for cover letter.
- User moves application to rejected accidentally.
- User has overdue reminders.
- P1: user creates outreach not linked to an application.
- User wants to delete a document used in an application.
- AI output includes unsupported claim.
- User has multiple CV versions with similar names.

Expected handling:

- Avoid silent failure.
- Show clear next step.
- Preserve user data unless deletion is explicit.
- Ask for missing context.
- Keep user in control of document changes.

## 18. Out Of Scope For P0 MVP

- Auto-applying to jobs.
- Sending emails from ApplyWise.
- Direct inbox sync.
- Browser extension.
- Native iOS app.
- Full interview prep workspace.
- Outreach draft helper and outreach log.
- Full document versioning.
- Reliable PDF/DOCX text extraction if it slows the core workflow.
- External job APIs.
- Email reminder notifications.
- Recruiter dashboards.
- University admin dashboards.
- Paid subscription checkout.
- Multi-language support.
- Video interview practice.
- Advanced analytics.
- Public user profiles.
- AI claims that cannot be traced to user-provided evidence.

## 19. Definition Of Done

The P0 MVP is complete when:

- Landing page captures waitlist emails and shows confirmation.
- User can sign up, complete onboarding, and paste CV text or skip CV input.
- User can browse/search stored jobs and manually create a job.
- User can save a job and automatically create an application in `Saved`.
- User can move applications through all approved statuses.
- User can add deadline, next action, notes, reminders, and documents to an application.
- User can generate CV tailoring suggestions from a selected job and CV.
- User can generate and save an editable cover letter.
- Home shows active applications, upcoming reminders, and next actions.
- Supabase RLS prevents cross-user access to private data.
- The app does not expose private CV files publicly.
- UI follows `DESIGN.md` and avoids fake metrics or overpromising copy.

## 20. Product Copy Guardrails

Use:

- "Here is your next best step."
- "This job looks relevant based on your target roles."
- "Your CV could be stronger for this role."
- "Add a follow-up reminder."
- "This claim needs evidence before you include it."

Avoid:

- "Guaranteed interviews."
- "Get hired faster with AI."
- "Apply to hundreds of jobs automatically."
- "Beat applicant tracking systems."
- "Let AI do the job search for you."

## 21. Final Questions For The Team

Answer these before serious build work:

1. What source will validate the "50+ applications" claim?
2. Confirm whether the first launch target should be a private beta with graduate users before public launch.
3. Which source should provide the manually seeded jobs for v1: team-curated postings, university portals, public company career pages, or partner job feeds?
4. Which single tracker view should P0 ship first: compact list or simple kanban?
5. What is the minimum tracker workflow that would make graduates choose ApplyWise over a spreadsheet?
