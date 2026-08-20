# Sylva Herbarium — Digital Botanical Archive & Research Platform

A digital herbarium and specimen cataloging system with a public archive
(search, browse, specimen detail pages) and a full admin panel (specimen
management, photo uploads, team invitations, activity log, dashboard).

**Stack: React 19 + JavaScript + JSX + Express + HTML/CSS (Tailwind).
No TypeScript anywhere in this project.**

---

## Project Structure

```
sylva-js/
├── src/
│   ├── components/common/     Navbar, Footer, SpecimenCard, PhotoGalleryModal,
│   │                          ConfirmModal, ConservationBadge
│   ├── context/
│   │   └── AuthContext.jsx    Logged-in admin state, available app-wide via useAuth()
│   ├── pages/
│   │   ├── public/            HomePage, SearchResultsPage, SpecimenDetailPage,
│   │   │                      FamiliesPage, AboutPage, ContactPage,
│   │   │                      AcceptInvitationPage, NotFoundPage
│   │   └── admin/              AdminLoginPage, AdminLayout, AdminDashboardPage,
│   │                          AdminSpecimensListPage, AdminSpecimenEditorPage,
│   │                          AdminTeamPage, AdminAuditLogsPage
│   ├── services/
│   │   └── api.js             Every network call to the backend goes through here
│   ├── App.jsx                 Routes
│   ├── main.jsx                 React entry point
│   └── index.css                Tailwind + design tokens (colors, fonts)
│
├── server.js                   Express app: all /api/* routes
├── server/
│   ├── db.js                   File-based JSON "database" + all data logic
│   └── auth.js                 Login sessions & auth middleware
│
├── data/herbarium.json         Auto-created on first run — all persisted data
├── uploads/                    Auto-created on first run — uploaded photo files
└── package.json
```

---

## Main Features

**Public site:** homepage with live archive stats, specimen search/filter,
specimen detail pages with photo galleries, families index, about/contact
pages.

**Admin panel** (`/admin`, login required):
- Dashboard with live stats, taxonomy breakdown, recent activity
- Specimen list: search, filter, bulk publish/unpublish, bulk delete
- Specimen editor: full form (taxonomy, collection data, conservation
  status, uses/notes) with photo upload, draft/publish workflow
- Team page: invite colleagues, view pending invitations, copy invite
  link, revoke invitations, activate/deactivate accounts
- Audit log of every change made in the system

## How Specimen Upload & the Specimen Path Work

1. In the specimen editor, an admin picks a local image file.
2. The frontend (`src/pages/admin/AdminSpecimenEditorPage.jsx`) sends it
   to `POST /api/photos/upload` as `multipart/form-data`
   (`src/services/api.js` → `uploadPhotoFile`).
3. On the server (`server.js`), Multer validates the file type (JPG, PNG,
   WebP, TIFF, GIF only) and size (15MB max), then saves it into the
   `/uploads` folder with a unique generated name, e.g.
   `specimen-1755590000000-a1b2c3.jpg`.
4. The server responds with that file's public URL — the **specimen
   path** — e.g. `/uploads/specimen-1755590000000-a1b2c3.jpg`. Because
   `/uploads` is served statically by Express, that path loads directly
   in the browser.
5. When the admin attaches the photo and saves the specimen form, that
   path is stored permanently as the photo's `storageUrl` in
   `data/herbarium.json`, and is what's shown on the public specimen page
   afterward.

**For production**, replace the local `/uploads` folder with a hosted
object-storage service (Amazon S3, Google Cloud Storage, Cloudinary,
etc.). Only the Multer configuration near the top of `server.js` needs to
change — the rest of the app only ever deals with the final URL string,
so nothing else is affected.

## How Admin Invite Works

A superadmin fills in a colleague's name, email, and role and submits the
form. The server (`POST /api/team/invite`) creates a **pending**
invitation with a random token that expires after 7 days, and returns an
invite link built from that token. The admin panel shows this link with a
"Copy Link" button to share manually (there is no real outbound email
service wired up — see the note below). When the invitee opens
`/admin/accept-invitation?token=...` and sets a password, their account
is created and the invitation is marked **accepted**. Invitations can also
be **revoked** at any time, and the status (`pending` / `accepted` /
`expired` / `revoked`) is always visible in the team list.

## Data Persistence

There is no separate mail/inbox feature in this project — instead,
visitors submit inquiries through the public **Contact** page, and those
are the closest equivalent (stored messages an admin can review via
`GET /api/contact/messages`). No outbound email is sent for these either;
see the note below.

All application data (users, specimens, photos, invitations, activity
logs, contact messages) lives in a single file: `data/herbarium.json`.
Every change goes through a `persist()` call in `server/db.js`, which
rewrites that file, so data survives a server restart. This is a simple,
working setup for development/demo use.

**For production**, swap `server/db.js` for a real database (PostgreSQL,
MySQL, MongoDB, etc.). Its public methods (`findUserByEmail`,
`createSpecimen`, `createInvitation`, and so on) can stay the same, so
`server.js` and the React frontend would not need to change.

## Where to Connect a Real Email Provider

Two places currently generate content that would be emailed in
production, but only save it to the database for now:
- `POST /api/team/invite` in `server.js` (admin invitations)
- `POST /api/contact` in `server.js` (contact inquiries)

Both are marked with `EMAIL SENDING` comments in the code showing exactly
where to call a provider such as Resend, SendGrid, or Amazon SES.

---

## Installation & Running

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**

Demo admin login (seeded automatically on first run):
```
Email:    curator@sylva-herbarium.org
Password: Botanist2026!
```

### Other scripts
```bash
npm run build     # Build the production frontend into /dist
npm run start      # Run in production mode (serves the built /dist folder)
```

## Known Limitations

- No real outbound email — invitations and contact replies must be
  shared/handled manually (see "Where to Connect a Real Email Provider").
- Data is stored in a single JSON file rather than a real database —
  fine for demo/small-team use, not for high concurrent write volume.
- Login sessions are kept in memory, so they are cleared if the server
  restarts.
