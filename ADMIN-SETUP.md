# Admin Panel — Setup Guide

The admin panel at `/admin.html` lets you change prices, hide/show cakes, and add new cakes with photos. It saves to **Supabase** (free tier), so every visitor sees updates instantly.

## One-time setup (~10 minutes)

### 1. Create a Supabase account
Go to https://supabase.com → **Start your project** → sign up free → **New project**.
Pick any name (e.g. `sweet-crumbs`), a database password, and a region near Mumbai.

### 2. Run the setup SQL
In your project: **SQL Editor** → **New query** → paste the entire contents of
`supabase-setup.sql` (included in this folder) → **Run**.

This creates the `cakes` table, security rules, an image bucket, and pre-loads all 21 current cakes with their prices.

### 3. Allow admin logins only
**Authentication** → **Sign In / Providers**:
- Disable **"Allow new users to sign up"** (important — nobody else should be able to make accounts).
- Email provider stays ON.

### 4. Paste your keys into the site
**Project Settings** (gear icon) → **API**. Copy two values:

- **Project URL** → paste as `SUPABASE_URL`
- **anon public key** → paste as `SUPABASE_ANON_KEY`

into the file `supabase-config.js`:

```js
const SUPABASE_URL = "https://xxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

### 5. Create YOUR login
**Authentication** → **Users** → **Add user** → **Create new user**.
Enter your email + password, tick **Auto Confirm User**.

This email/password is what you type into the admin panel.

### 6. Deploy & open
Push/deploy the folder as usual (e.g. `vercel --prod`). Then open:

```
https://your-site.vercel.app/admin.html
```

Log in once — you stay signed in on that device.

## Daily use

| Task | How |
|---|---|
| Change a price | Edit the ₹ fields in the table — it saves the moment you click away |
| Hide a cake | Untick **Live** in its row (cake is kept, just hidden) |
| Add a cake | **+ Add New Cake**, fill details, upload photo, **Save Cake** |
| Edit a cake | **Edit** button in its row |
| Delete a cake | **Delete** button (asks for confirmation, removes photo too) |

Prices are for 500g. The 1kg price shown on the site is always auto-calculated (`base × 1.85`, rounded to ₹50), so you never set it twice.

## Notes

- The anon key in `supabase-config.js` is safe to expose — write access requires your login, enforced server-side by row-level security.
- If Supabase is ever down or keys are missing, the site silently falls back to the built-in cake list, so it never breaks.
