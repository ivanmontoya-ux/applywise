# ApplyWise Local Setup

This guide is for running the ApplyWise demo locally on a teammate's Mac.

## 1. Install Dependencies

From the project folder:

```bash
npm install
```

## 2. Create Local Environment Files

The real API keys are not committed to GitHub. Create local copies from the examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## 3. Fill `client/.env`

Required for signup and login:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use the same Supabase project values as the rest of the team, or create your own Supabase project and schema.

## 4. Fill `server/.env`

Minimum for the main demo:

```env
PORT=3001
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
```

Optional job refresh API:

```env
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

Optional Gmail import:

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/integrations/gmail/callback
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly
GMAIL_TOKEN_ENCRYPTION_KEY=generate_a_long_random_server_only_secret
```

Optional overview email digest:

```env
RESEND_API_KEY=your_resend_api_key
DIGEST_FROM_EMAIL=ApplyWise <onboarding@resend.dev>
```

## Optional: Social Login

The Login and Sign Up screens include Facebook and LinkedIn login buttons. To make them work, enable the providers in Supabase:

1. Open Supabase.
2. Go to Authentication > Providers.
3. Enable Facebook and LinkedIn.
4. Add the client ID and secret from each provider's developer portal.
5. In the Facebook/LinkedIn developer portals, add the callback URL shown by Supabase, usually:

```text
https://your-project-ref.supabase.co/auth/v1/callback
```

6. In Supabase Authentication > URL Configuration, add the local app redirect URL:

```text
http://localhost:5173/dashboard
```

Instagram is shown as a future option in the UI. It needs a custom OAuth setup before it can work as a login provider.

## 5. Start The App

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## 6. Check Configuration In The App

Open:

```text
http://localhost:5173/settings
```

The setup checklist shows which features are ready and which local keys are missing.

## Common Issues

### "API key is missing"

The relevant value is missing in `server/.env` or `client/.env`. After editing either file, stop and restart:

```bash
npm run dev
```

### Gemini features do not work

Check `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

### Login or signup does not work

Check `client/.env` and `server/.env` both contain the Supabase URL and publishable key.

### Gmail connection does not work

Check the Google OAuth redirect URI in Google Cloud exactly matches:

```text
http://localhost:3001/api/integrations/gmail/callback
```

### Overview email says accepted but no email arrives

Check Resend logs. In test mode, Resend may only send to the account owner's email until a sending domain is verified.

## Security Rule

Never commit these files:

```text
server/.env
client/.env
```

Only share keys privately with trusted team members.
