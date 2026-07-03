# ApplyWise User Evidence

Date: 2026-07-03

## Evidence Status

This file separates recorded evidence from assumptions. The team has informal validation from friends and family, internal prototype interviews/tests with all 7 group members, an informal survey with another group from class, prototype/build feedback, and local product signals. No completed formal target-user interview transcripts, exported survey dataset, or expert-review transcripts are currently stored in this repository.

For professor submission, the key point is that early qualitative reaction was positive across several informal validation sources. Friends and family liked the tool, all group members tested the application and proposed improvements, and another class group saw the need for the feature. The next validation step should still test behavior with a larger qualified graduate user group.

## Recorded Evidence

### Prototype And Build Feedback

Source: product-owner feedback during app building and prototype review.

Observed requests and decisions:

- Users should be able to see all features before signing up, while storing private data should require an account.
- The job feed should include general business roles, not only finance jobs.
- CV upload should extract structured personal information.
- Extracted Personal Information should be saved for reuse across the app.
- AI should recommend jobs from the job list based on saved Personal Information.
- CV recommendations and generated cover letters should be saved inside the specific job application.
- Cover letters should be exportable as a document.
- Localhost development creates confusion on Safari, smartphones, and other Macs because the terminal/server must be running.

Product implications:

- Keep demo mode for exploration.
- Treat Personal Information as central AI context.
- Keep application-specific AI outputs attached to tracker records.
- Deploy the frontend on Netlify for validation instead of relying on local-only testing.

### Informal Friends And Family Validation

Source: informal conversations and prototype review with friends and family.

Summary:

- The team showed the ApplyWise concept and prototype to friends and family.
- Everyone reacted positively and liked the tool.
- Reviewers understood the value of keeping jobs, application statuses, CV information, cover letters, and reminders in one place.
- The strongest positive reaction was to the idea of reducing job-search chaos and making the next step clearer.

What this supports:

- The concept is understandable to non-technical users.
- The product feels useful beyond a narrow finance-only job search.
- The AI features are easier to trust when they sit inside an organized tracker rather than acting as a separate writing tool.

Limitations:

- Friends and family are not a representative market sample.
- Positive feedback may be biased because reviewers know the team.
- This evidence shows interest and clarity, but it does not yet prove repeated use or willingness to enter real CV data.

How it changed the product:

- We emphasized demo-mode access so people can explore before committing.
- We made the job feed broader than finance.
- We made Personal Information reusable across AI features.
- We saved cover letters and CV recommendations to the specific application instead of leaving them as copy-only outputs.

### Internal Group Interviews And Prototype Tests

Source: internal interviews and hands-on prototype testing by the ApplyWise project group.

Participants:

- 7 group members tested the application.
- Each member tried the product from the perspective of a graduate job seeker and reviewed the main workflows.

Tested workflows:

1. Opening the app and understanding the purpose.
2. Browsing the Jobs page.
3. Reviewing the job filters and role categories.
4. Saving or adding job applications.
5. Checking the Tracker workflow.
6. Uploading or extracting CV information.
7. Reviewing the Personal Information page.
8. Testing AI-supported CV recommendations, cover letters, and job recommendations.

What we learned:

- The application concept was clear to all group members.
- The team agreed that the strongest value is the complete workflow, not one isolated feature.
- The Jobs page needed broader business roles, not only finance-related jobs.
- The app should be usable before login so testers and future users can understand the feature set quickly.
- Private storage must still require an account because CV data and applications are sensitive.
- Extracted CV information should be saved once and reused across the app.
- Generated cover letters and CV recommendations should be saved inside the specific application.
- AI job recommendations should be shown above the job list after the user has uploaded and saved CV-derived Personal Information.

Improvements made based on group testing:

- Added general business-related job searches and sector filters.
- Added demo-mode access with Login and Sign Up buttons in the top-right corner.
- Added CV extraction into saved Personal Information.
- Added AI job recommendations based on saved Personal Information and the current job list.
- Added saving of generated cover letters and CV recommendations to the selected application.
- Added cover letter document export.
- Updated the documentation, architecture, and data plan for a Netlify frontend and authenticated user-scoped storage.

Interpretation:

- This is stronger than idea-only feedback because the team tested the working application and produced concrete product changes.
- It is still internal validation, so the next step should be external testing with target graduates.

### Informal Class-Group Survey

Source: informal survey and feedback discussion with another group from class.

Summary:

- The team shared the ApplyWise concept and feature direction with another class group.
- Everyone in that group saw the need for the feature.
- The strongest need they recognized was reducing the chaos of tracking many applications, CV changes, cover letters, and deadlines across separate tools.

What this supports:

- The problem is understandable to students and early-career job seekers.
- The feature set addresses a real workflow pain, not only a technical idea.
- There is interest in a tool that combines job tracking with AI-supported application preparation.

Limitations:

- This was an informal class survey, not a statistically representative survey.
- The sample size and exact responses should be recorded in a future survey sheet if the project continues.
- The next survey should ask for quantified answers on number of applications, tools used, willingness to upload CV data, and likelihood of using ApplyWise weekly.

### Landing-Page Signals

Source: local SQLite development database.

Current counts:

- Waitlist signups: 1.
- Latest local signup timestamp: 2026-07-01 14:00:41.

Interpretation:

- This confirms the waitlist storage path works locally.
- This is not enough to validate market demand.
- The next smoke test should use a deployed Netlify URL and targeted graduate traffic.

### Prototype Usage Signals

Source: local SQLite development database.

Current counts:

- Jobs stored locally: 559.
- Tracked applications: 2.
- Distinct tracker users: 1.
- Saved Personal Information profiles: 1.

Interpretation:

- The core data paths exist: job list, tracker, and saved CV-derived profile.
- These are development records, not external user behavior.
- The next test must ask qualified users to add real or anonymized applications.

## Evidence Not Yet Collected

### External Interviews

Status: not yet recorded beyond internal group interviews.

Recommended interview target:

- 8-10 recent bachelor's or master's graduates in Europe.
- Must be applying to skilled early-career roles in business, tech, finance, consulting, marketing, operations, or data.
- Ideally managing at least 10 active, saved, or planned applications.

Interview questions:

1. How many applications are you currently tracking?
2. Which tools do you use for jobs, statuses, documents, reminders, and follow-ups?
3. What was the last deadline, follow-up, or document task you almost missed?
4. How do you tailor your CV or cover letter today?
5. Would you upload or paste an anonymized CV into a private tool if it gave role-specific recommendations?
6. What would make you distrust an AI recommendation?
7. What would make ApplyWise more useful than your current spreadsheet or notes system?

### Formal Surveys

Status: informal class-group survey completed; formal survey dataset not yet recorded.

Recommended survey measures:

- Number of active applications.
- Number of tools used for job search management.
- Frequency of missed or nearly missed deadlines/follow-ups.
- Time spent tailoring each application.
- Willingness to upload anonymized CV text.
- Interest in job recommendations based on CV profile.
- Interest in application tracker, CV suggestions, cover letter generator, reminders, and job recommendations.

### Prototype Tests

Status: app prototype exists, target-user tests not yet recorded.

Recommended task script:

1. Open the deployed ApplyWise prototype.
2. Browse Jobs without logging in.
3. Sign up or log in.
4. Upload or paste an anonymized CV.
5. Save extracted Personal Information.
6. Review AI job recommendations on Jobs.
7. Save one job to Tracker.
8. Generate CV recommendations or a cover letter.
9. Save the output to the application.
10. Explain what you would do next outside the app.

Success criteria:

- User completes the flow in under 12 minutes.
- User understands that storage requires an account.
- User can explain why a recommended job was selected.
- User finds at least one AI output specific enough to edit and use.
- User says what information they would not be comfortable storing.

### Expert Feedback

Status: not yet recorded.

Recommended reviewers:

- University career-services advisor.
- Graduate recruiter or early-career hiring manager.
- GDPR/privacy-aware product or legal reviewer.

Review prompts:

- Does the AI output stay truthful and evidence-based?
- Does the product avoid overpromising job outcomes?
- Does the data plan match reasonable expectations for CV and application data?
- Which parts would concern a student or graduate user?

## Evidence Quality Notes

- Product-owner feedback is useful for shaping the prototype but should not be treated as target-user validation.
- Friends and family feedback is useful early qualitative evidence, but it should be labelled as informal validation.
- Internal group testing is useful because all 7 members used the app and translated feedback into improvements, but it is still not independent market validation.
- The informal class-group survey supports the need for the feature, but it should be followed by a more structured survey with recorded responses.
- Local database records prove technical flow, not user demand.
- The next validation milestone should collect behavioral evidence from qualified graduates using a deployed version.
