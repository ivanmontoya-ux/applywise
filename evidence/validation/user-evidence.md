# ApplyWise User Evidence

Date: 2026-07-03

## Evidence Status

This file separates recorded evidence from assumptions. The team has informal validation from friends and family, prototype/build feedback, and local product signals. No completed formal target-user interview transcripts, survey exports, or expert-review transcripts are currently stored in this repository.

For professor submission, the key point is that early qualitative reaction was positive, but the next validation step should still test behavior with qualified graduate users.

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

### Interviews

Status: not yet recorded.

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

### Surveys

Status: not yet recorded.

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
- Local database records prove technical flow, not user demand.
- The next validation milestone should collect behavioral evidence from qualified graduates using a deployed version.
