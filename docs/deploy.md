# Deploying Alivora to Vercel

Vercel builds the app straight from GitHub. Once connected, every push to
`claude/new-session-5c51cr` (the repository's default branch) redeploys
production automatically, and other branches get their own preview URL.

## First deploy (about 2 minutes)

1. Go to <https://vercel.com/signup> and choose **Continue with GitHub**.
   The free **Hobby** plan is enough.
2. On <https://vercel.com/new>, find **Neyofissie/ALIVORA** and press
   **Import**. If it isn't listed, choose **Adjust GitHub App Permissions**
   and give Vercel access to the repository.
3. Leave the detected settings as they are:
   - Framework preset: **Next.js**
   - Build command: `pnpm build`, install command: `pnpm install`
     (both detected from `pnpm-lock.yaml`)
   - Root directory: `./`
4. Skip **Environment Variables** for now. Without them the app runs in
   **demo mode** on sample data, which is what this version is built for.
5. Press **Deploy**. When it finishes, Vercel shows your URL, such as
   `alivora-xxxx.vercel.app`.

## What you get

- The full clickable app: onboarding, Home, Tomorrow Ready, Planner, Tasks,
  Alivora AI, Family and Settings.
- Data is kept in each visitor's own browser. Nothing is shared between
  devices or people yet.
- The app can be added to a phone's home screen (it has a web app manifest).

## Later: connecting the live database

When real accounts are wired into the app (the next milestone), add these
in Vercel under **Project → Settings → Environment Variables**, then redeploy:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bzuqhfozsvahwfpxinid.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's publishable key |

Then, in Supabase under **Authentication → URL Configuration**, set the
**Site URL** to your Vercel URL and add `https://<your-domain>/auth/confirm`
to **Redirect URLs** so sign-up and password-reset emails link back
correctly.

## Custom domain

In Vercel, open **Project → Settings → Domains**, add the domain, and
follow the DNS instructions it shows.
