# 🛡️ FraudSafe – Consumer Fraud Awareness Portal

A website that helps consumers identify and prevent online frauds and scams.

**Tech:** HTML5 · CSS3 · Vanilla JavaScript · Supabase (PostgreSQL + Auth) · Static hosting (Render / GitHub Pages / Netlify)

---

## What runs where

| Part | Where it runs | What it does |
|---|---|---|
| `index.html`, `style.css`, `script.js`, `supabase.js` | **Your visitor's browser** | Pages, fraud cards, quiz, login forms |
| Supabase Auth | **Supabase servers** | Registers users, stores hashed passwords, issues sessions, sends confirmation emails |
| Supabase Database (`profiles`, `reports`) | **Supabase servers** | Stores profiles and reports. **Row Level Security** decides who can read what |
| Render / GitHub Pages | **Hosting server** | Only serves the 4 files above. No Node.js server is needed any more |

Because there is no custom backend, there are **no secrets on your hosting** to configure. The only values in the browser are the public Supabase URL and publishable key.

---

## Files

```
index.html            Pages, modals, forms
style.css             Original design + a few additions
script.js             Site logic + Supabase login/profile/report code
supabase.js           ← YOU EDIT THIS: Project URL + publishable key
supabase-schema.sql   Database tables, trigger, security rules (RLS)
README.md             This file
```

Removed from the old project (no longer needed): `server.js`, `package.json`, `package-lock.json`, `node_modules`, `.env` / `DATABASE_URL` / `JWT_SECRET`.

---

## Setup (step by step)

### 1. Create a Supabase project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Choose a name, set a **database password** (save it in a password manager – you will *not* need it in this website), pick the region closest to you.
3. Wait about 2 minutes until the project is ready.

### 2. Run the SQL
1. In your project open **SQL Editor** → **New query**.
2. Open `supabase-schema.sql`, copy **everything**, paste it, click **Run**.
3. You should see "Success". Check **Table Editor**: tables `profiles` and `reports` exist, each marked with RLS enabled.

### 3. Add your URL and publishable key
1. Go to **Project Settings → API** (newer dashboards: **API Keys**).
2. Copy the **Project URL** and the **publishable** key (older projects call it **anon** key).
3. Open `supabase.js` and replace the two placeholders:
   ```js
   const SUPABASE_URL = "https://abcdxyz.supabase.co";
   const SUPABASE_PUBLISHABLE_KEY = "your-publishable-key";
   ```
4. ❌ **Never** put the `service_role` / secret key or the database password in any file of this website.

### 4. Authentication settings
In **Authentication** (dashboard sidebar):
- **Sign In / Providers → Email**: make sure Email is enabled.
- **Confirm email**: your choice.
  - **ON** (recommended for the real site): users must click a link in their inbox before they can log in. The website already handles this.
  - **OFF** (easy for demos): users are logged in immediately after registering.
  - Supabase's built-in email sender has a **very low hourly limit**. If you demo to a class and many people register, turn confirmation OFF temporarily or set up your own SMTP.
- **Minimum password length**: the website requires 8 characters. Set the same (or higher) in the Auth settings so the server enforces it too.
- **URL Configuration** (do this again after deploying, see step 7):
  - **Site URL** = your live website address
  - **Redirect URLs** = add your live address and your local test address

### 5. Test on your computer
You cannot just double-click `index.html` for login (browsers block some features on `file://`). Use a tiny local server:
- **VS Code**: install the *Live Server* extension → right-click `index.html` → **Open with Live Server** (usually `http://127.0.0.1:5500`).
- or in a terminal inside the folder: `python -m http.server 5500` → open `http://localhost:5500`.

Add that address (e.g. `http://localhost:5500` and `http://127.0.0.1:5500`) to **Authentication → URL Configuration → Redirect URLs**.

### 6. Upload to GitHub
1. Create a new repository on GitHub (e.g. `fraudsafe`).
2. Put the 6 files in the **root** of the repository (delete the old `server.js`, `package*.json`, `node_modules`).
3. Using the website: **Add file → Upload files** → drag the files → **Commit changes**.
   Or with Git:
   ```bash
   git add .
   git commit -m "Convert FraudSafe to Supabase"
   git push
   ```
4. Make sure no `.env` file is in the repository. If your **old** `.env` (with `DATABASE_URL` / `JWT_SECRET`) was ever uploaded to GitHub, change the old Render database password and treat the old secrets as leaked.

### 7. Deploy
**Option A – Render Static Site** (you already use Render)
1. Render dashboard → **New → Static Site** → connect your GitHub repo.
2. **Build Command**: leave empty (or `echo done`). **Publish Directory**: `.`
3. **Create Static Site**. You get an address like `https://fraudsafe.onrender.com`.
4. Delete the old Render **Web Service** and the old Render **PostgreSQL** database when you are sure you no longer need them.

**Option B – GitHub Pages**: repo **Settings → Pages** → Deploy from branch → `main` / root. Address: `https://YOUR-NAME.github.io/fraudsafe/`.

**Then go back to Supabase → Authentication → URL Configuration** and set:
- **Site URL**: your live address
- **Redirect URLs**: add your live address (for GitHub Pages include the `/fraudsafe/` part)

Without this step, confirmation-email links will point to the wrong place.

---

## Testing checklist

Run these on `localhost` first, then again on the deployed site.

**Pages and buttons**
- [ ] Every nav link (Home, Frauds, Safety Tips, Quiz, Report, FAQ) switches page
- [ ] Hero buttons and the 4 Quick Access cards open the right page
- [ ] Each of the 10 fraud cards → **Learn More** opens a popup with description, warning signs, prevention tips
- [ ] Popup closes with ×, Escape, and clicking outside it
- [ ] Fraud search filters the cards
- [ ] Safety checklist, quiz, FAQ accordion work
- [ ] 🌙 dark mode toggles and is remembered after reload
- [ ] 🔗 Share copies the link (or opens the share sheet on a phone)
- [ ] Layout looks right at desktop, tablet (~800px) and phone (~400px) widths

**Registration**
- [ ] Empty fields / password under 8 characters → clear error
- [ ] Valid registration, confirmation **ON** → "Check your email" message; link in email opens the site and shows "Email confirmed"
- [ ] Valid registration, confirmation **OFF** → logged in immediately
- [ ] Registering the same email again → "already registered" message
- [ ] In Supabase **Table Editor → profiles**: a row with the right name and email appears

**Login / session / logout**
- [ ] Wrong password → "Invalid email or password."
- [ ] Unconfirmed account (confirmation ON) → "Please confirm your email first."
- [ ] Correct login → header shows 👤 *your first name* and **Logout**; **Login** button disappears
- [ ] Reload the page → still logged in
- [ ] Turn off Wi-Fi and try logging in → network error message
- [ ] Logout → header returns to **Login**; profile page no longer opens

**Profile**
- [ ] Click your name in the header → profile page shows name, email, member-since date
- [ ] Change the name → saved; header updates; still correct after reload
- [ ] Logged out + click Account/profile → login popup appears instead

**Reports**
- [ ] Submit a report while logged out → success message; row appears in **Table Editor → reports** with empty `user_id`
- [ ] Submit while logged in → row has your `user_id`; name/email were pre-filled

**Security (RLS) check** – with two test accounts A and B, logged in as A, open the browser console (F12) and run:
```js
(await supabaseClient.from("profiles").select("*")).data
```
- [ ] Only **A's** row is returned (never B's)
```js
(await supabaseClient.from("profiles").update({ name: "hacked" }).eq("id", "B-USER-UUID-HERE").select()).data
```
- [ ] Returns an empty list and B's name is unchanged

---

## Troubleshooting

| Problem | Likely cause / fix |
|---|---|
| "Supabase is not set up yet" | `supabase.js` still has the placeholder values |
| Login popup works but nothing happens | Open F12 → Console for the exact error; check URL/key typos |
| Confirmation link opens a wrong or blank page | **Site URL / Redirect URLs** in Supabase don't match your live address |
| "email rate limit exceeded" | Built-in email limit; wait, turn confirmation OFF, or add custom SMTP |
| Profile name empty after registering | The SQL trigger didn't run: re-run `supabase-schema.sql` (it back-fills missing profiles) |
| Reports fail to send | Check the SQL ran fully; the fraud type text must match the list in the SQL |

---

## Notes

- Passwords are never stored by this project; Supabase Auth stores only secure hashes.
- Hiding the Profile page in JavaScript is only a convenience. The real protection is **Row Level Security** in the database.
- Anonymous visitors can submit reports (like the original form). If you get spam, require login for reports or enable CAPTCHA in Supabase Auth/Bot protection.
