# Campus Facility Analytics Portal

A secure, zero knowledge feedback system designed to bridge the gap between students and college administration.

## Current Status & Deployment Plan
**Status: In Active Development**
This project is currently being built and refined, with the explicit goal of being deployed for public use across the campus. The initial launch will be a beta test to ensure the AI moderation and cryptographic hashing hold up under real-world conditions before a full administrative rollout.

## The Problem
Students often hesitate to report legitimate infrastructure, academic, or facility issues due to the fear of retaliation. Traditional physical complaint boxes lack transparency, and standard email-based ticketing systems inherently compromise privacy.

## The Solution
This portal provides a 100% anonymous, frictionless way for students to submit actionable feedback. It utilizes a two-tier verification system to ensure that only legitimate students can post, without ever linking their personal identity to their submission payload. 

## Core Architecture: The Trust Layer

### 1. Zero-Knowledge Authentication (Privacy First)
To prevent external spam, users must verify their status using their official college email (`@mgits.ac.in`). 
**We do not store your email.**
The backend utilizes a oneway cryptographic hashing function (SHA-256) paired with a server-side salt. The system verifies the college domain, hashes the email to prevent spamming, and immediately drops the raw string. 
*Result:* Neither the developers nor the college administration can reverse-engineer the hash to expose the identity of the user. 

### 2. AI Content Moderation
To prevent the platform from turning into an unmoderated gossip board, all incoming text payloads are routed through an LLM moderation API before reaching the database.
* **Constructive Feedback** (e.g., "The AC in CS Lab 3 is leaking") passes the filter and is queued for admin review.
* **Toxic Content** (e.g., profanity, targeted harassment, or non-sensical spam) is automatically rejected. 

### 3. The Quarantine Dashboard
Complaints do not go public automatically. Approved submissions enter a `pending_manual_review` state in MongoDB. The college administration is provided with a secure, analytical dashboard that categorizes issues to help them pinpoint bottlenecks efficiently.

## Tech Stack
* Frontend: React.js, GSAP (Cinematic UI/UX), React Router
* Backend: Node.js, Express.js
* Database: MongoDB & Mongoose
* Security: Native Node `crypto` for SHA-256 hashing
* Moderation: LLM API integration for automated trust scoring

## Local Development Setup

1. Clone the repository:
`git clone https://github.com/Mekkaden/Campus-Facility-Portal.git`

2. Install dependencies:
`cd backend && npm install`
`cd ../frontend && npm install`

3. Configure Environment Variables:
Create a `.env` file in the `backend` directory with the following:
`PORT=5000`
`MONGO_URI=your_mongodb_cluster_url`
`SERVER_SECRET_SALT=your_random_secure_string`
`LLM_API_KEY=your_moderation_api_key`

4. Spin up the servers:
`cd backend && npm start`
`cd ../frontend && npm start`

## Audit Transparency
Trust is the foundation of this platform. Techsavvy students and administrators are highly encouraged to audit the source code specifically the authentication routing to verify that raw emails are strictly used for onetime hashing and never persist in the database.

---
**License & Credits**
Open-source under the MIT License.
Made with caffeine by Mekkaden.
