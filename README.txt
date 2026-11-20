LAAR INSTITUTE MANAGEMENT SYSTEM — NETLIFY EDITION
==================================================

This version is designed for Netlify:
- Static frontend in /public
- Netlify serverless function API
- Netlify Blobs for persistent application data
- Principal login is server-side
- No Gmail/Google login required

PRINCIPAL LOGIN
Username: litprincicpal
Password: lit2026

The username/password are NOT displayed on the login screen. A user must enter them.

DEPLOY
1. Upload this folder/repository to GitHub OR drag the ZIP/folder into a Netlify deploy workflow.
2. Netlify detects netlify.toml.
3. The site uses the /public folder and /netlify/functions.
4. The application stores records in Netlify Blobs.

IMPORTANT FIRST STEP
For production, set an environment variable in Netlify:
AUTH_SECRET = a long random secret
The app has a fallback secret only so a first deployment can start; replace it before real use.

NETLIFY BLOBS
The application uses the @netlify/blobs package and a persistent store named "laar-data".
If your Netlify account/site setup requires Blobs to be enabled or linked, enable Netlify Blobs in the site's storage section.

FEATURES
- Principal login
- Student management
- Teacher management
- Course management
- Shifts
- Batches
- Course modules/topics
- Daily classes
- Attendance
- Individual progress
- Practical work
- Tests/results
- Dashboard
- Responsive mobile UI

NOTE
This is a practical V2 starter. For a larger production deployment, add:
- granular teacher logins/permissions
- password reset
- file/photo uploads
- PDF/Excel reports
- audit logs UI
- email notifications
- backups/export
- richer filtering and editing forms
