# ApplyWise AI Startup Validation Board

Project: ApplyWise  
Group members: Theresa, Gayathri, Ivan, Ophelie, Elisa, Angelo, Jacob 
Date: June 30, 2026

## July 3, 2026 Validation Update

After the first validation board was drafted, the team also shared the ApplyWise concept and prototype informally with friends and family. The reaction was positive: everyone shown the tool liked it and understood why it could help graduates organize applications, CV information, cover letters, reminders, and AI recommendations in one private workspace.

The team also conducted internal interviews/tests: all 7 group members tried the application, reviewed the main workflows, and made recommendations for improvement. The team also ran an informal survey and feedback discussion with another group from class, where everybody saw the need for the feature.

This feedback supports the clarity of the concept, but it is not enough by itself to prove product-market fit. Friends and family, group members, and classmates are useful early validation sources, but they are still convenience samples. The next validation step should focus on target graduates and behavior: whether they add real or anonymized applications, save CV-derived Personal Information, trust AI suggestions, and return to update the tracker.

What this validation taught us:

- The product should be explained as a practical job-search command center, not only an AI CV tool.
- The job feed should include general business roles, not only finance.
- Users should be able to explore the app before signing up.
- Private storage should remain account-gated.
- CV extraction should create reusable Personal Information.
- AI outputs should be saved to the specific application.
- AI recommendations should include reasons and evidence.
- A Netlify deployment is important for easier professor review and user testing.
- Internal group testing should lead to visible product changes, not only discussion.

## One-Line Validation Goal

Prove whether recent graduates will enter real applications and CV evidence into ApplyWise, trust the AI support, and return because it improves their job-search workflow.

## The AI Hypothesis Stack

### Customer Hypothesis

Recent bachelor's or master's graduates in Europe, within 24 months of graduation, who are applying to early-career skilled roles in business, tech, finance, consulting, marketing, or operations and are managing 10 or more job opportunities across multiple tools.

They feel the pain when they have saved jobs on different platforms, application statuses in spreadsheets, CV and cover letter versions in documents, deadlines in calendars, and AI drafts in ChatGPT with no single source of truth.

### Problem Hypothesis

These graduates lose time, miss follow-ups, and reduce application quality because job descriptions, deadlines, statuses, documents, reminders, and next actions are scattered across disconnected tools.

Quantifiable pain to test:

- They manage 10 or more active, saved, or planned applications.
- They use 3 or more tools to manage the job search.
- They spend at least 20 minutes per application on admin, tracking, tailoring, or deciding next actions.
- They have missed or almost missed at least one deadline, follow-up, assessment, or document requirement.
- They reuse generic CV or cover letter content because tailoring each application takes too long.

### Solution And UX Hypothesis

ApplyWise creates better value by combining a simple application tracker with AI support inside one private workspace. Users can add or save jobs, track application status, see deadlines and next actions, paste CV evidence, receive AI CV fit suggestions, and generate editable job-specific cover letters.

AI creates better value by turning unstructured job descriptions and CV text into:

- job requirements;
- confirmed candidate evidence;
- missing evidence;
- risky or unsupported claims;
- suggested CV improvements;
- editable cover letter drafts.

The UX works if users can add 3 real applications quickly, understand their next actions without a spreadsheet, and trust that AI suggestions are grounded in their actual experience.

### AI Technical Hypothesis

The model can deliver consistent, structured, low-hallucination output when it is constrained to user-provided job descriptions, CV text, application notes, and user preferences.

The AI output is acceptable only if it:

- extracts job requirements accurately;
- separates confirmed evidence from missing evidence;
- does not invent experience, metrics, certifications, languages, or achievements;
- flags unsupported claims instead of polishing them;
- generates cover letters tied to the company, role, job requirements, and real candidate evidence;
- asks follow-up questions when information is missing.

Minimum technical threshold: zero invented candidate experience in reviewed outputs, at least 4/5 average user trust score, and outputs that users can edit and realistically use.

## 1. Hypothesis Stack

| Hypothesis | ApplyWise Version | What We Must Test |
|---|---|---|
| Customer | Recent bachelor's or master's graduates in Europe applying to early-career skilled roles. | Do they manage enough applications to need a dedicated tool, and will they try one before a full product exists? |
| Problem | Applications, job descriptions, deadlines, CV versions, cover letters, and reminders are scattered across job boards, spreadsheets, documents, email, calendars, and ChatGPT. | Will users show real pain through behavior: submitting real jobs, deadlines, statuses, and current workflows? |
| Solution and UX | One private workspace to add jobs, track applications, see next actions, paste CV text, get AI CV fit suggestions, and generate editable cover letters. | Can users add 3 applications quickly and understand their next actions without needing a separate spreadsheet? |
| AI Technical | AI extracts job requirements, compares them with CV evidence, flags gaps, and drafts truthful cover letters without inventing experience. | Can outputs be useful, specific, and trusted with zero invented candidate experience after review? |

## 2. Riskiest Assumption

**Leap of faith:** Graduates will trust ApplyWise enough to enter real applications and CV evidence, then return because the combined tracker plus AI document support is better than their spreadsheet plus ChatGPT workflow.

Why this can kill the startup:

- If users refuse to enter real application data, ApplyWise cannot become a job-search command center.
- If users will not share CV text, the AI cannot produce genuinely personalized suggestions.
- If users try it once but do not return, the product is a one-time helper rather than an ongoing workflow.
- If the AI fabricates experience or feels generic, users will not trust it with high-stakes career materials.

## 3. Experiment Plan

| Element | Plan |
|---|---|
| Test level | Smoke test landing page, concierge test, and Wizard of Oz AI prototype. |
| Duration | Run in less than 2 weeks. |
| Participants | 20-30 qualified recent graduates in Europe applying to business, tech, finance, consulting, marketing, or operations roles. |
| Core task | Ask each user to add 3 real applications, one job description, and CV text or an anonymized CV. |
| Team output | Return a simple tracker, next actions, job requirements map, CV fit analysis, evidence gaps, risk flags, and one editable cover letter draft. |
| Behavior measured | Signup, onboarding completion, real data submission, CV sharing, AI output usefulness, trust score, and return within 7 days. |

User flow:

1. User sees the landing page and clicks to try ApplyWise.
2. User completes a short qualification form.
3. User adds 3 real applications or saved jobs.
4. User pastes one job description and CV text or anonymized CV.
5. Team manually prepares the ApplyWise-style tracker and AI outputs.
6. User reviews the output and rates usefulness, trust, and willingness to continue.
7. After 5-7 days, user is asked whether they used the output or wants another application processed.

## 4. Minimum Success Criteria

| Metric | Minimum Threshold |
|---|---|
| Waitlist or access requests | 12 of 20 qualified users |
| Completed onboarding | 8 of 20 qualified users |
| Real application submission | 6 users submit at least 3 real jobs/applications |
| CV evidence submission | 5 users submit CV text or an anonymized CV |
| AI usefulness | 5 users rate the AI-assisted output at least 4/5 |
| Return behavior | 4 users return within 7 days or request help with another application |
| Hallucination control | 0 invented candidate experiences in reviewed outputs |

**Primary pass/fail rule:** Positive comments are not enough. The experiment only works if users submit real data and show return behavior.

## 5. Results And Validation Lab

| Users submit real applications, deadlines, statuses, and CV evidence. | Users say the idea is useful but refuse to enter real application data. |
| Users rate AI outputs 4/5 or higher for usefulness and trust. | Users distrust the AI, prefer ChatGPT directly, or discard the output. |
| Users edit or use the CV suggestions or cover letter draft. | AI outputs are generic, misleading, or invent candidate experience. |
| Users return within 7 days or request another application package. | Users try it once and do not return. |

## 6. Decision Loop

| Iterate | Users behave positively but onboarding, privacy copy, or AI format creates friction. | Simplify fields, improve privacy reassurance, and label evidence/gaps more clearly. |
| A/B test | Users show interest, but the strongest value proposition is unclear. | Test tracker-first vs. AI CV-helper vs. next-action positioning. |
| Pivot | One workflow is clearly valued more than the full command center. | Narrow to CV assistant, tracker-only, or a specific graduate niche. |
| Kill | Users will not enter real data, do not return, or AI cannot be made trustworthy. | Stop building the current concept and preserve only validated learnings. |

## 7. AI Hallucination Risks

Most likely hallucinations:

- Inventing internships, skills, certifications, languages, metrics, or achievements.
- Overstating the user's fit for a job without evidence.
- Missing mandatory requirements such as language, location, work permit, or degree type.
- Creating generic cover letters that are not grounded in the user's CV.
- Guessing deadlines, recruiter names, company facts, or application status.

Controls:

- AI must separate confirmed evidence, missing evidence, and questions.
- AI must ask for missing information instead of inventing it.
- All CV suggestions and cover letters remain editable and user-approved.
- No output is valid unless it can be traced to the job description, CV text, or user notes.
- Launch threshold: zero critical hallucinations in reviewed outputs.

## Strict Conclusion

ApplyWise should only move forward if graduates show real behavior: entering applications, sharing CV evidence, trusting the AI output, and returning. Liking the idea in interviews is not validation.
