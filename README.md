# Sweet Crumbs Bakery — Online Cake Ordering

A fast, mobile-first cake ordering website for **Sweet Crumbs Bakery**, Bengaluru. Customers browse the catalogue and order directly through **WhatsApp** — no cart, no payment gateway, no friction.

**Live site:** https://cake-two-nu.vercel.app
**Admin panel:** https://cake-two-nu.vercel.app/admin.html

---

## Features

- 21-product catalogue with categories (bestsellers, eggless, photo, theme, kids, heart-shaped)
- Weight-based pricing — pick 500g or 1kg; the 1kg price is auto-calculated from the base price
- Discount badges with strike-through MRP
- Sorting by popularity / price / rating
- One-tap WhatsApp ordering with a pre-filled message including the cake, weight, price, and photo link
- Fully responsive — optimized down to small phones
- Zero frameworks: plain HTML/CSS/JS

### Admin panel

- Email/password login via Supabase Auth
- Inline price editing that saves instantly
- Add / edit / delete cakes with image upload to cloud storage
- Hide a cake from the site without deleting it
- Changes go live for every visitor immediately

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Frontend   | Vanilla HTML, CSS, JavaScript (no build step)       |
| Database   | Supabase (Postgres + Row Level Security)            |
| Auth       | Supabase Auth (email/password)                      |
| Storage    | Supabase Storage (public bucket for cake photos)    |
| Hosting    | Vercel                                              |

## Project structure

```
├── index.html           # Storefront
├── script.js            # Catalogue rendering, filters, WhatsApp links
├── styles.css           # All styling (storefront + admin)
├── admin.html           # Admin panel UI
├── admin.js             # Admin panel logic (login, CRUD, uploads)
├── supabase-config.js   # Project URL + publishable key (public by design)
├── supabase-setup.sql   # One-time DB setup: table, RLS, storage, seed data
├── supabase-harden.sql  # Optional: DB-level input validation constraints
├── vercel.json          # Security headers (CSP, X-Frame-Options, etc.)
├── images/              # Product photos
└── ADMIN-SETUP.md       # Full admin/Supabase setup walkthrough
```

## Running locally

No build step required.

```bash
# clone
git clone https://github.com/rkprosit/cake.git
cd cake

# open
start index.html        # Windows
open index.html         # macOS
```

Without Supabase keys the site automatically falls back to the built-in catalogue, so it works offline out of the box.

## Setting up your own backend

Full walkthrough in [ADMIN-SETUP.md](./ADMIN-SETUP.md). Short version:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase-setup.sql` in the SQL Editor
3. Disable new-user signups, create your own admin user under Authentication → Users
4. Paste the project URL and publishable key into `supabase-config.js`
5. Deploy (`vercel --prod`)

## Security model

- **Write access** requires an authenticated admin session, enforced server-side by Postgres Row Level Security — the browser key cannot modify data
- **Read access** is public: the catalogue is meant to be public
- The key in `supabase-config.js` is Supabase's *publishable* key, designed to be exposed (equivalent of a username, not a password)
- Strict Content-Security-Policy, `X-Frame-Options`, `nosniff` and other headers set in `vercel.json`
- All database-sourced values are HTML-escaped before rendering (XSS-safe)
- `supabase-harden.sql` adds CHECK constraints so invalid prices/ratings/categories can never be written, even through a compromised client
- Passwords are bcrypt-hashed by Supabase; all traffic is HTTPS; data at rest is AES-256 encrypted

## Deployment

Any static host works. On Vercel:

```bash
vercel --prod
```

Or connect the repo in the Vercel dashboard for automatic deploys on every push.
