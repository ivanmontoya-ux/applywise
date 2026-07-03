# ApplyWise Validation Board

Date: 2026-07-03

## Validation Goal

Test whether graduates will use ApplyWise as a private job-search workspace, not just as a one-time AI writing tool. The riskiest behavior is whether users enter real applications, save CV-derived personal information, trust AI recommendations, and return to keep the tracker current.

## Validation Summary

Current validation is based on prototype testing, product-owner review, local product signals, informal feedback from friends and family, internal interviews/tests with all 7 group members, and an informal survey with another group from class. The reaction was positive: friends and family liked the tool, all group members tested it and made recommendations, and the other class group saw the need for the feature.

This is encouraging, but it is not yet enough to claim product-market fit. Friends and family feedback, internal group testing, and informal class feedback are useful for checking whether the concept is understandable and useful, but the next step should test behavior with a larger target-user sample. The strongest learning so far is that the product should be broader than finance jobs, should let users explore before signing up, and should store AI outputs inside the related application so the workflow stays organized.

## Assumptions Tested

| Assumption | How We Tested It | What We Learned | Confidence |
|---|---|---|---|
| Graduates need a combined job-finding and application-tracking workflow. | Built Jobs, Tracker, Home, Documents, Coach, and Reminders around the workflow in `Final_PRD.md` and collected repeated product-owner feedback while using the prototype. | The strongest product direction remains a command center: jobs, statuses, documents, and next actions in one place. | Medium |
| A finance-only job feed is too narrow. | Product feedback identified that the job feed felt finance-only. The Adzuna search queries and sector filters were expanded to general business, consulting, operations, marketing, product, sales, HR, supply chain, data, and finance roles. | The initial niche should stay early-career skilled roles, but the role set must include general business jobs, not only finance. | Medium |
| Users need to inspect the app before creating an account. | Auth was changed so Login and Sign Up sit in the top-right while demo-mode users can view features. Storage actions still require an account. | Sign-up gating was too heavy during building and testing. The right boundary is: explore without account, store private information only with account. | Medium |
| CV extraction becomes more valuable if the extracted information is reusable. | Added CV upload/extraction and saved the extracted profile under Personal Information. | The profile should become shared context for CV suggestions, cover letters, and job recommendations. | Medium |
| AI recommendations should be based on the user's saved CV profile, not generic job popularity. | Added AI job recommendations above the Jobs page after a saved Personal Information profile exists. | Recommendations should be explainable and limited to the current job list. The app should avoid black-box match scores without evidence. | Low to medium |
| AI-generated cover letters and CV recommendations must be saved inside the specific application. | Added save-to-application behavior for cover letters and CV recommendations, plus Word document export for cover letters. | AI output is only useful if it becomes part of the application record. Copy-only output recreates the same scattered workflow ApplyWise is trying to solve. | Medium |
| Local-only development creates friction for non-technical testing. | Multiple local usage issues appeared around Safari, smartphone access, localhost, and the need for the terminal/server to keep running. | A deployed frontend is required for easier validation. The architecture should use Netlify for the frontend and a hosted backend/API. | High |
| The concept is easy to understand and feels useful to non-technical reviewers. | Shared the idea and prototype informally with friends and family. Everyone reacted positively and said the tool would be useful for organizing applications. | The positioning is understandable: ApplyWise should be explained as a practical job-search command center, not only an AI CV tool. | Medium |
| The working prototype supports the intended user journey. | All 7 group members tried the application and reviewed the main workflows: Jobs, Tracker, CV extraction, Personal Information, AI recommendations, and cover letter generation. | The prototype was usable enough to reveal concrete improvements, especially broader job categories, demo access, reusable Personal Information, and application-specific AI outputs. | Medium |
| Students outside the team recognize the need. | Ran an informal survey and feedback discussion with another group from class. Everyone saw the need for the feature. | The pain of scattered job applications, documents, and deadlines is easy for students to understand. The next step is to quantify this with a structured survey. | Medium |
| Users will provide real CV and application data. | Not yet tested with a target-user cohort. Local database contains 1 saved personal-information profile and 2 tracked applications, but this is development data. | This remains the biggest unvalidated assumption. It needs interviews, prototype tests, and a privacy-focused onboarding test. | Low |

## Current Prototype Signals

These are development/prototype signals from the local database, not market validation:

- Waitlist signups: 1 local signup.
- Tracked applications: 2 local application records from 1 user.
- Saved Personal Information profiles: 1 local profile.
- Jobs available in local job table: 559.

The numbers show that the app flow is technically usable, but they do not prove target-user demand.

## Informal Friends And Family Validation

The team also shared the ApplyWise concept and prototype informally with friends and family. The response was positive: everyone liked the tool and understood why it could help graduates manage applications with less stress.

What this validated:

- The basic concept is easy to explain.
- The combined workflow feels more useful than a standalone CV builder.
- The product promise, "find and track better job applications with less chaos," is understandable.
- People responded well to a calm, organized tool rather than a loud AI product.

Limitations:

- Friends and family are a convenience sample and may be biased toward positive feedback.
- Positive reactions do not prove that graduates will enter real CV or application data.
- The next validation step must test behavior with target users, not just opinions.

## Internal Group Testing

All 7 ApplyWise group members tried the application and reviewed the core workflows. The team used these tests like internal interviews: each person looked at the product from the perspective of a graduate job seeker and gave recommendations for what should change.

What the group testing validated:

- The core workflow is understandable: Jobs, Tracker, Documents, Personal Information, Coach, and Reminders fit together.
- The product should not be limited to finance jobs.
- Users should be able to try the product before creating an account.
- Saved Personal Information is important because the same CV data can power several features.
- AI recommendations and generated documents need to stay tied to the specific application.

Improvements made after group testing:

- Broadened the job feed to general business roles.
- Added demo-mode access with Login and Sign Up visible in the top-right corner.
- Added CV extraction and saved Personal Information.
- Added AI job recommendations above the Jobs page.
- Added saving of CV recommendations and cover letters to applications.
- Added cover letter document export.

## Informal Class-Group Survey

The team also conducted an informal survey and feedback discussion with another group from class. Everyone in that group saw the need for this feature. The feedback supported the idea that students and early-career applicants understand the pain of tracking applications, documents, cover letters, CV changes, and deadlines across disconnected tools.

What this validated:

- The problem is recognizable beyond the ApplyWise team.
- The combined tracker plus AI document support is easier to understand than a standalone AI writing tool.
- The next validation round should collect structured survey responses so the team can quantify the need.

## Reflection: What Validation Taught Us

Validation changed the product in several practical ways:

- **Broaden the jobs scope:** The first job feed looked too finance-heavy. The app now includes general business, consulting, marketing, operations, product, sales, HR, supply chain, data, and finance roles.
- **Lower the access barrier:** Users should be able to see and try the app before signing up. Storage still requires an account because private data must be protected.
- **Make Personal Information reusable:** CV extraction should not be a one-time output. The extracted profile now powers CV suggestions, cover letters, and job recommendations.
- **Attach AI output to applications:** Generated cover letters and CV recommendations only create lasting value when saved inside the relevant tracker item.
- **Keep AI explainable:** Job recommendations need reasons, fit labels, and evidence. A bare match score would not be trustworthy enough.
- **Deploy for easier testing:** Localhost testing created confusion, so the frontend should be deployed on Netlify for validation and professor review.
- **Treat privacy as part of the product:** Users may like the tool, but storing CV and application data requires clear account boundaries and user-controlled saving.
- **Turn feedback into product changes:** Internal group testing produced direct improvements instead of only positive comments.

## Riskiest Remaining Assumptions

1. Target graduates will trust ApplyWise with real CV and application data.
2. AI output will be trusted only if it cites candidate evidence and does not invent achievements.
3. Users will return weekly to update the tracker, not only generate a cover letter once.
4. Job recommendations are valuable only if the job list has enough relevant non-finance business roles.
5. Privacy copy and account boundaries must be clear enough for European users handling CV data.

## Next Validation Tests

| Test | Participants | Task | Success Signal |
|---|---|---|---|
| Prototype usability test | 5-8 graduates in Europe currently applying to jobs | Add 3 real applications, upload or paste an anonymized CV, save one AI output to an application. | 5 users complete the flow without needing a spreadsheet. |
| Trust test for AI output | 5 graduates plus 1 career-services reviewer | Review CV recommendations, cover letter, and job recommendations. Mark any fabricated or unsupported claim. | Zero invented candidate experience; average trust score at least 4/5. |
| Landing-page smoke test | 100-200 targeted visitors | Visit Netlify landing page and join waitlist. | At least 8-12 qualified signups, with target role and strongest need filled. |
| Return-behavior test | 5 beta users over 7 days | Continue tracking real applications and update statuses/reminders. | At least 3 users return and update an application or reminder. |

## Decision Rule

Move forward only if users submit real applications or anonymized CV evidence, trust the AI output, and return to the tracker. Positive comments alone are not enough.
