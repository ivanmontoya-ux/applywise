# Design System: ApplyWise

## 1. Design Intent

ApplyWise is a calm job-search command center for graduates. The product must feel professional, supportive, private, and easy to return to every day. It should help users find relevant jobs, track applications, and know the next action without feeling judged or overwhelmed.

The interface should feel like a focused productivity tool with career-coach intelligence inside it. It should not feel like a playful student app, a loud AI startup page, or a generic HR dashboard.

Design principles:

- Prioritize clarity over decoration.
- Make the next action obvious.
- Keep private career data visually calm and protected.
- Use AI moments as structured assistance, not spectacle.
- Build dense enough for repeated use, but never crowded.
- Treat job finding and application tracking as the primary workflows.

Taste settings:

- Density: Daily App Balanced, 6/10.
- Variance: Offset Asymmetric, 5/10.
- Motion: Restrained Fluid CSS, 4/10.
- Mood: calm, capable, organized, private, career-focused.

## 2. Color System

Use a neutral zinc/slate base with one restrained brand accent. The product must not drift into neon blue, purple AI glow, beige lifestyle startup, or dark cyber dashboard styling.

### Core Colors

- **Canvas Mist** (#F8FAFC) - Primary page background for the authenticated app and landing page.
- **Pure Surface** (#FFFFFF) - Form surfaces, job cards, document panels, modals, and focused content areas.
- **Charcoal Ink** (#18181B) - Primary text, page titles, labels, active navigation, and high-priority values.
- **Muted Steel** (#71717A) - Secondary text, helper copy, timestamps, empty-state text, and inactive labels.
- **Whisper Line** (#E4E4E7) - Borders, dividers, input outlines, tracker column separators, and card edges.
- **Applied Teal** (#2F6F73) - Single brand accent for primary buttons, active tabs, focus rings, selected chips, and key progress moments.

### Functional State Colors

Use functional colors sparingly and only for state communication. They are not brand accents.

- **Error Red** (#B42318) - Validation errors, failed upload, destructive confirmation text.
- **Warning Amber** (#A15C07) - Overdue reminders, missing documents, upcoming deadline warning.
- **Success Green** (#2F6B45) - Saved confirmation, completed reminder, accepted success state.
- **Info Slate** (#475569) - Neutral guidance and system notes.

### Color Rules

- Applied Teal is the only brand accent.
- Never use pure black (#000000).
- Never use neon glows, oversaturated gradients, purple/blue AI effects, or rainbow status systems.
- Status badges should be mostly neutral; use text, border, icon, and layout to communicate state before adding color.
- Error and warning colors should appear in small UI surfaces, not as full-page backgrounds.
- Keep contrast high enough for long reading sessions and dense tracker screens.

## 3. Typography

ApplyWise should use a serious, modern sans-serif system with enough character to avoid looking generic.

### Font Stack

- **Display:** Geist, fallback sans-serif.
- **Body:** Geist, fallback sans-serif.
- **Mono:** Geist Mono, fallback monospace.

### Type Rules

- No Inter.
- No serif fonts in product screens.
- No decorative fonts.
- No negative letter spacing.
- Body copy max width: 65 characters.
- Body text minimum size: 1rem on content pages and 0.875rem only for compact app metadata.
- Use hierarchy through weight, spacing, and color before increasing size.

### Scale

- Landing H1: `clamp(2.75rem, 7vw, 5.5rem)`, line-height 0.95-1.05.
- Page title: 1.5rem-2rem, line-height 1.15.
- Section heading: 1rem-1.125rem, semibold.
- Panel heading: 0.875rem-1rem, semibold.
- Body: 1rem, line-height 1.5-1.65.
- Compact metadata: 0.75rem-0.875rem, line-height 1.2.
- Numeric metadata, deadlines, application counts, and versions should use Geist Mono.

## 4. Component System

### Buttons

Primary buttons:

- Applied Teal fill, white text.
- 8px radius.
- Minimum height 44px.
- Active state moves down 1px and slightly reduces opacity.
- Use for one primary action per view: Save Job, Join Waitlist, Generate Cover Letter, Add Reminder.

Secondary buttons:

- Pure Surface fill, Whisper Line border, Charcoal Ink text.
- Same dimensions as primary.
- Use for supporting actions: Edit, Cancel, Copy Draft, Upload New CV.

Ghost buttons:

- Transparent background.
- Charcoal Ink or Muted Steel text.
- Hover uses subtle Canvas Mist tint.
- Use inside cards, rows, and compact panels.

Destructive buttons:

- White or transparent background with Error Red text.
- Confirm destructive actions in a modal.

### Inputs And Forms

- Label above every input.
- Helper text below when useful.
- Error text below the field.
- No floating labels.
- 8px radius.
- 44px minimum height.
- Focus ring in Applied Teal.
- Required fields should be marked with text, not only color.
- Long forms should be split into short sections with clear save states.

### Cards

Use cards only for individual repeated items or focused panels. Do not put cards inside cards.

Card rules:

- 8px radius.
- Pure Surface background.
- Whisper Line border.
- Minimal zinc shadow only when elevation helps hierarchy.
- Use stable dimensions for job cards, tracker cards, reminder cards, and document rows.

### Job Cards

Job cards must show:

- Role title.
- Company.
- Location.
- Work model.
- Industry or role type.
- Deadline if known.
- Save state.

Use compact metadata rows. Do not show fake match percentages unless a real scoring system exists.

### Application Cards

Application cards must show:

- Role title.
- Company.
- Status.
- Deadline or next action.
- Reminder indicator.
- Document readiness: Missing, Partial, or Complete.

Tracker cards should be scannable in under 3 seconds.

### Status Badges

Statuses:

- Saved
- Applied
- Interview
- Assessment
- Offer
- Rejected
- Withdrawn

Badge rules:

- 6px radius.
- Neutral tint and border.
- Use compact text labels.
- Avoid rainbow columns.
- Use icons only if they improve scan speed.

### Tabs And Segmented Controls

- Use for Tracker mobile status views and document filters.
- Active state uses Applied Teal underline or subtle tint.
- Labels must not resize the control.
- All tap targets must be at least 44px.

### Modals

Use modals for:

- Confirming deletion.
- Editing application status with confirmation details.
- Uploading CV.
- Creating a reminder.

Do not use modals for large workflows like full CV tailoring or interview prep.

### Empty States

Empty states should tell the user what to do next, not simply state that nothing exists.

Examples:

- Empty Jobs: "Save your first job to start tracking applications."
- Empty Tracker: "Applications you save will appear here by status."
- Empty Documents: "Upload a CV to tailor it for saved jobs."

Empty states may use simple product-preview skeletons, but no mascots or playful illustrations.

### Loading States

- Use skeleton loaders that match the final layout.
- No generic circular spinners.
- AI generation should show structured progress text such as "Reading job requirements" and "Checking CV evidence."

### Error States

Error messages must be specific and recoverable.

Examples:

- "Upload failed. Use a PDF or DOCX under 10 MB."
- "Paste the job description before generating CV suggestions."
- "This outreach draft was not saved. Try again."

Avoid blame-heavy or vague errors.

## 5. Microcopy

ApplyWise microcopy should be direct, calm, and useful. It should act like a strict but supportive career consultant.

### Voice

- Professional.
- Supportive.
- Concise.
- Honest about missing evidence.
- Calm when users are behind.
- Specific about next actions.

### Good Microcopy

- "Here is your next best step."
- "This job matches your target roles and location."
- "Your CV needs more evidence for this requirement."
- "Add a follow-up reminder before you mark this as applied."
- "Paste the job description to tailor your documents."
- "This claim needs evidence before you include it."
- "No deadline yet. Add one if the posting includes it."
- "You have applications without next actions."
- "This draft is ready to review, not ready to send automatically."

### Empty-State Copy

- Jobs: "Find or add a job to start building your application list."
- Tracker: "Saved jobs become applications here."
- Documents: "Upload a CV before tailoring applications."
- Coach: "Choose an application so the coach can give specific advice."
- Reminders: "No reminders yet. Add one from an application when there is a deadline or follow-up."

### Error Copy

- "We need a job description before generating suggestions."
- "We need CV text before reviewing fit."
- "This file type is not supported. Upload a PDF or DOCX."
- "This application already exists. Opening the existing tracker item."
- "This field is required to save the job."

### Confirmation Copy

- "Job saved to Tracker."
- "Application moved to Applied."
- "Reminder created."
- "Cover letter saved."
- "Outreach draft copied."

### Banned Copy

- "Guaranteed interviews."
- "Get hired faster with AI."
- "Apply to hundreds of jobs automatically."
- "Beat applicant tracking systems."
- "Let AI do the job search for you."
- "Supercharge your career."
- "Unlock your potential."
- "Seamless application journey."
- "Next-gen job search."

## 6. Layout Principles

### App Shell

Desktop:

- Left sidebar navigation.
- Main content area.
- Optional right-side context panel for next action, coach prompt, or application summary.
- Max width: 1400px for app screens.

Mobile:

- Bottom tab navigation: Home, Jobs, Tracker, Documents, Coach.
- Reminders and Settings accessible from Home or profile.
- Tracker uses segmented status tabs, not horizontal kanban.

### Core Screen Layouts

Home:

- Today panel first.
- Active applications second.
- Upcoming reminders third.
- Suggested jobs or saved jobs without next action.

Jobs:

- Search bar at top.
- Filter row below.
- Job cards in a scannable list.
- Manual Add Job button visible but not dominant.

Tracker:

- Desktop uses kanban with status columns.
- Mobile uses segmented status tabs and stacked cards.
- Keep card height stable across statuses.

Application Detail:

- Header with role, company, and status.
- Next action near the top.
- Key dates, documents, reminders, notes, interview prep, outreach log, and activity timeline as distinct sections.

Documents:

- Organize by document type and linked application.
- Show version labels and updated date.

Coach:

- Use a serious writing-workspace layout.
- Show selected application context at the top.
- Starter actions should be task buttons, not marketing prompts.

### Responsive Rules

- Collapse all multi-column layouts below 768px.
- No horizontal page scroll on mobile.
- All touch targets must be at least 44px.
- Avoid viewport-width font scaling except with `clamp()`.
- Full-height sections use `min-h-[100dvh]`, not `h-screen`.
- Use CSS Grid for page architecture and avoid percentage `calc()` hacks.

## 7. Motion And Interaction

Motion should communicate progress and state changes. It should never feel decorative or distracting.

Rules:

- Animate only `transform` and `opacity`.
- Default spring feel: stiffness 100, damping 20.
- List items reveal with 40ms-70ms stagger, capped at 350ms total.
- Save Job uses a one-time pressed state and short saved confirmation.
- Tracker card movement should settle into the new column with restrained motion.
- AI generation uses skeleton progress, not bouncing dots.
- Respect reduced-motion preferences.

Allowed micro-interactions:

- Button press.
- Card hover lift of 1px.
- Soft focus ring.
- Saved confirmation.
- Reminder chip subtle pulse for overdue state only.

Banned micro-interactions:

- Confetti.
- Spinning loaders.
- Bouncing arrows.
- Custom cursors.
- AI glow effects.
- Constant floating decorations.

## 8. Visual Assets

Use product-relevant visuals only.

Allowed:

- Product previews.
- Document thumbnails.
- Job card previews.
- Tracker previews.
- Simple UI screenshots or generated interface mockups.

Avoid:

- Generic laptop stock photos.
- Dark blurred office backgrounds.
- Random graduate photos.
- Decorative gradient orbs.
- Mascots.
- Broken Unsplash links.

## 9. Antipatterns

Never use:

- Emojis.
- Inter font.
- Pure black (#000000).
- Neon glows.
- Purple/blue AI gradients.
- Oversaturated accents.
- Excessive gradient text.
- Custom mouse cursors.
- Overlapping elements.
- Centered hero layouts.
- 3 equal feature-card rows.
- Fake metrics or fabricated statistics.
- Fake application success rates.
- Generic names like John Doe, Acme, or Nexus.
- `LABEL // YEAR` typography.
- Empty buzzwords such as Elevate, Seamless, Unleash, Next-Gen, Revolutionary, Supercharge.
- Shame-based job-search language.
- Loud gamification, streak pressure, or confetti.
- UI copy that implies ApplyWise applies to jobs automatically.

## 10. Build Checklist

Before approving any screen:

- Does the screen make the next action clear?
- Does it respect the single-accent color system?
- Does it use Geist and Geist Mono correctly?
- Are all interactive controls at least 44px?
- Is private user data visually calm and clearly protected?
- Are empty, loading, error, and success states designed?
- Does the screen avoid fake metrics and overpromising copy?
- Does mobile collapse without horizontal overflow?
- Does the UI prioritize job finding and application tracking before secondary features?
