LAAR INSTITUTE MANAGEMENT SYSTEM — FINAL NETLIFY BUILD
========================================================

This version fixes the previous frontend error:
    "Uncaught TypeError: login is not a function"

The login handler is now named loginUser and is attached with addEventListener.
There is no inline onclick="login()" and no form field named "login".

LOGIN
-----
Username: litprincicpal
Password: lit2026

NETLIFY DEPLOYMENT
------------------
This project is designed for Netlify Git deployment.

Required repository structure:
    netlify.toml
    package.json
    public/index.html
    netlify/functions/api.js

Netlify configuration:
    Publish directory: public
    Functions directory: netlify/functions
    Build command: leave blank

If you already connected your Netlify project to GitHub:
1. Replace the contents of the GitHub repository with ALL files from this ZIP.
2. Commit/push the changes.
3. Netlify will automatically create a new deploy.
4. Wait until the deploy says Published.
5. Open the site and login.

OPTIONAL ENVIRONMENT VARIABLES
------------------------------
For better security you can add:
    PRINCIPAL_USERNAME = litprincicpal
    PRINCIPAL_PASSWORD = lit2026

If they are not added, the app uses the requested default credentials above.

DATA STORAGE
------------
The API uses Netlify Blobs site-wide storage named "laar-data".
Data persists between deployments.

FUNCTION ENDPOINTS
------------------
POST /api/login
POST /api/logout
GET  /api/health
GET  /api/data
POST /api/data
DELETE /api/data

IMPORTANT
---------
Do not use Netlify Drop for this project after the GitHub connection is established.
Use the GitHub-connected project so Netlify builds and deploys the serverless function.

If login ever fails:
- Open Netlify > Cloud compute > Functions
- Confirm "api" exists
- Open the function logs
- Test https://YOUR-SITE.netlify.app/api/health
It should return JSON with ok: true.
