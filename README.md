# Vizz — Sign Language Video Calling (Full Project)

## Overview
This project is a demo of a sign-language-aware video calling app:
- Express + MongoDB backend (JWT auth, contacts, call logs)
- Socket.io for signaling (WebRTC offers/answers)
- Frontend SPA with login/signup/home and call page
- MediaPipe Hands used for simple gesture heuristics (demo only)

## Setup
1. Unzip and open terminal in `server` folder.
2. Copy `.env.sample` to `.env` and fill `MONGO_URI` and `JWT_SECRET`.
3. Install packages:
   ```bash
   cd server
   npm install
   ```
4. Start server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` and sign up / login.

## Notes
- Replace gesture heuristics with proper ASL/ISL model for production.
- Add TURN server for reliable peer connections behind NATs.
- Do not commit real `.env` values to public repos.
