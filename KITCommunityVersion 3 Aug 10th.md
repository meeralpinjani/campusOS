# KITCommunity — Version 3 (Aug 10th, 2026) Architecture & Implementation Spec

## Overview
**KITCommunity Version 3** introduces critical security, governance, and engagement enhancements to the Kolhapur Institute of Technology (KIT) campus community web application. This release streamlines the core feature set by removing obsolete components, establishing strict institutional posting permissions, introducing a dedicated Marketplace module, automating community request workflows, adding campus event & poll systems, and providing an official PDF notice generator with verification QR codes.

---

## 0. Housekeeping & Cleanup

- **Dead File & Asset Removal**:
  - Remove obsolete/unused components including `KITMeetModal.jsx` and old build caches (`dist/`, `.vite/`).
- **Cache Management**:
  - Purge client and server package caches (`npm cache clean --force`, Vite dev cache reset).
- **Dependency Vulnerability Audit**:
  - Execute `npm audit fix` across both `/client` and `/server` workspaces without introducing major version breaking changes.
- **Database Sanitization & Seeding**:
  - Complete wipe of all MongoDB collections (`posts`, `comments`, `users`, `channels`, `marketplacelistings`, `communityrequests`, `events`, `polls`, `notifications`, `messages`).
  - Execute clean database seed script creating system master accounts (`admin@kit.edu`, `moderator@kit.edu`) and 20+ hierarchical campus channels (excluding `r/Buy_Sell_Trade`).

---

## 1. Feature Removal: KITMeet Video Call

- **Frontend Cleanup**:
  - Permanently remove `client/src/components/KITMeetModal.jsx`.
  - Remove all video call buttons, triggers, modal state hooks (`isMeetOpen`), and icon imports from `Navbar.jsx` and `App.jsx`.
- **Backend & Network**:
  - Ensure zero residual WebRTC / Jitsi dependencies or network endpoints remain in the codebase.

---

## 2. Posting Permissions: Official Announcements Channel

- **Access Policy**:
  - Restrict post creation in **Official Announcements** channels (`official-notices`, `general-lounge`, or any channel belonging to the `Official Announcements` group / marked `isRestricted: true`) strictly to users holding the `faculty` (or `admin`) role.
  - Students and other roles retain read, upvote, and commenting rights (where enabled), but cannot publish top-level posts in official notice channels.
- **Backend Validation**:
  - `postController.js` validates `req.user.role === 'faculty' || req.user.role === 'admin'` when targeting restricted channels, throwing `403 Forbidden` for unauthorized attempts.
- **UI Experience**:
  - `CreatePostModal.jsx` disables selection of official channels for student accounts and renders an explanatory banner: *"Posting in Official Announcements channels is reserved for Faculty members."*

---

## 3. Dedicated Marketplace Module (Replacing r/Buy_Sell_Trade)

- **Channel Removal**:
  - Remove `r/Buy_Sell_Trade` from channel sidebar navigation and seed scripts.
- **First-Class Marketplace Route (`/marketplace`)**:
  - Prominent Marketplace tab added directly to the main navbar.
- **Structured Listing Attributes**:
  - `title`: String
  - `description`: String
  - `category`: Enum (`Textbooks & Notes`, `Electronics & Gadgets`, `Drawing & Drafting Tools`, `Lab Equipment`, `Hostel Essentials`, `Vehicles & Cycles`, `Other`)
  - `condition`: Enum (`Brand New`, `Like New`, `Good`, `Fair`, `Used`)
  - `price`: Number (INR)
  - `originalPurchaseDate`: Date / String
  - `sellerContactPreference`: Enum (`In-App DM`, `Phone Call`, `WhatsApp`, `Email`)
  - `contactDetail`: String
  - `images`: Array of Image URLs
  - `sellerId`: Reference to `User`
  - `status`: Enum (`active`, `sold`, `removed`, `flagged`)
- **Verified Student Trust Badge**:
  - Displayed on seller profile pill for authenticated students, displaying their authenticated status and reputation score.
- **Moderation Workflow**:
  - Flag listing modal (`POST /api/marketplace/:id/flag`) allowing users to report inappropriate or commercial listings.
  - Moderation Queue Dashboard (`GET /api/marketplace/moderation/queue`) for Faculty, Mods, and Admins to review flagged items and click **Approve / Dismiss Flag** or **Remove Listing** (`POST /api/marketplace/:id/moderate`).

---

## 4. Community Creation Request & Approval Workflow

- **Student Creation Flow**:
  - Students click **"+ Request Community"** in `ChannelSidebar.jsx`, opening `CommunityRequestsModal.jsx`.
  - Submits requested community name, desired slug, description, category, and motivation/reason.
- **Request Schema (`CommunityRequest`)**:
  - `name`, `slug`, `description`, `type`, `category`, `group`, `icon`, `requestedBy`, `reason`, `status` (`pending`, `approved`, `rejected`), `reviewedBy`, `reviewComment`.
- **Faculty / Moderator / HOD Approval Queue**:
  - Faculty, Moderators, and Admins access the **Community Approval Dashboard**.
  - **Approve**: Automatically creates the new `Channel` document, updates request status to `approved`, and sends a success `Notification` to the requesting student.
  - **Reject**: Updates status to `rejected` with custom feedback comment, and notifies the requester.

---

## 5. New Institutional Features

### a. Campus Events & Hackathons Calendar (`/events`)
- **Centralized Campus Calendar**:
  - Tech fests, workshops, hackathons, seminars, and placement drives.
- **Interactive RSVP**:
  - One-click status toggles: **Attending**, **Interested**, **Not Attending**.
  - Live attendee counts automatically tracked on backend.
- **`.ics` iCalendar Export**:
  - Client-side `.ics` generator enabling immediate export to Google Calendar, Microsoft Outlook, and Apple Calendar.
- **Venue Mapping & Details**:
  - Detailed venue names, campus block location, dates, times, and organizer club/department.

### b. Campus Pulse Polls (Anti-Tamper)
- **Attachable Poll Widgets**:
  - Creatable by Faculty, Admins, and Student Council members via `CreatePostModal.jsx` or as standalone polls.
- **Target Role & Branch Gating**:
  - Restrict visibility/voting eligibility to specific branches (e.g. `Computer Science & Engineering`) or roles (e.g. `student`, `faculty`).
- **Database-Level Anti-Tamper Constraint**:
  - Enforce one vote per user per poll at the database driver level using Mongoose atomic queries:
    ```javascript
    await Poll.findOneAndUpdate(
      { _id: pollId, 'voters.userId': { $ne: req.user._id } },
      {
        $push: { voters: { userId: req.user._id, optionId } },
        $inc: { 'options.$[opt].votes': 1, totalVotes: 1 }
      },
      { arrayFilters: [{ 'opt._id': optionId }] }
    );
    ```
- **Live Animated Display**:
  - Smooth CSS percentage bar animations for results view once voted or for poll creators.

### c. Official PDF Notice Generator (Faculty Tool)
- **Institutional Design System**:
  - Render official KIT letterhead ("KOLHAPUR INSTITUTE OF TECHNOLOGY'S COLLEGE OF ENGINEERING (AUTONOMOUS)"), official reference numbers, timestamps, digital watermark seals, and sign-off blocks.
- **Client-Side Rendering**:
  - Powered by `jspdf`, `html2canvas`, and `qrcode`.
- **Verification QR Code**:
  - Dynamic QR code auto-embedded on every notice PDF, linking directly back to the post URL (`https://.../post/:id`) for instantaneous authenticity verification.

---

## 6. Interim Role Assignment by Email Domain

- **Interim Logic Heuristic**:
  - Isolated helper function `getInterimRoleFromEmail(email)` in `server/controllers/authController.js`:
    - Email ending in `@kitcoek.edu` -> default role: `faculty`.
    - All other domains (e.g. `@kit.edu`, `@gmail.com`) -> default role: `student`.
- **Decoupled Architecture**:
  - Explicitly commented and isolated in a single function to enable seamless removal when full CampusOS SSO identity sync is deployed.

---

## API Endpoints Reference Matrix

| Feature | Method | Endpoint | Access |
|---|---|---|---|
| **Auth Interim** | POST | `/api/auth/signup` | Public |
| **Auth Interim** | POST | `/api/auth/login` | Public |
| **Posts** | POST | `/api/posts` | Private (Faculty only for Official channels) |
| **Marketplace** | GET | `/api/marketplace` | Public |
| **Marketplace** | POST | `/api/marketplace` | Private |
| **Marketplace** | POST | `/api/marketplace/:id/flag` | Private |
| **Marketplace** | GET | `/api/marketplace/moderation/queue` | Faculty / Mod / Admin |
| **Marketplace** | POST | `/api/marketplace/:id/moderate` | Faculty / Mod / Admin |
| **Community Request** | POST | `/api/community-requests` | Private |
| **Community Request** | GET | `/api/community-requests` | Private |
| **Community Request** | POST | `/api/community-requests/:id/approve` | Faculty / Mod / Admin |
| **Community Request** | POST | `/api/community-requests/:id/reject` | Faculty / Mod / Admin |
| **Events** | GET | `/api/events` | Public |
| **Events** | POST | `/api/events` | Private |
| **Events** | POST | `/api/events/:id/rsvp` | Private |
| **Polls** | POST | `/api/polls` | Faculty / Admin / Council |
| **Polls** | POST | `/api/polls/:id/vote` | Private (Role & Branch Gated) |

---

## Summary of File System Changes

### New Files Created
- `server/models/MarketplaceListing.js`
- `server/controllers/marketplaceController.js`
- `server/routes/marketplaceRoutes.js`
- `server/models/CommunityRequest.js`
- `server/controllers/communityRequestController.js`
- `server/routes/communityRequestRoutes.js`
- `server/models/Event.js`
- `server/controllers/eventController.js`
- `server/routes/eventRoutes.js`
- `server/models/Poll.js`
- `server/controllers/pollController.js`
- `server/routes/pollRoutes.js`
- `client/src/pages/Marketplace.jsx`
- `client/src/components/CreateListingModal.jsx`
- `client/src/pages/EventsCalendar.jsx`
- `client/src/components/CreateEventModal.jsx`
- `client/src/components/CommunityRequestsModal.jsx`
- `client/src/components/PollWidget.jsx`
- `client/src/components/NoticePdfGeneratorModal.jsx`

### Files Modified
- `server/index.js`
- `server/utils/seedDB.js`
- `server/controllers/authController.js`
- `server/controllers/postController.js`
- `client/package.json`
- `client/src/App.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/components/ChannelSidebar.jsx`
- `client/src/components/CreatePostModal.jsx`
- `client/src/components/PostCard.jsx`
- `client/src/components/PostDetailModal.jsx`
- `client/src/services/api.js`

### Files Deleted
- `client/src/components/KITMeetModal.jsx`


CHAT: 
I have created a comprehensive implementation plan for the KITCommunity Maintenance & Feature Update Spec.

Please review the plan in 
implementation_plan.md
 which covers:

Housekeeping & DB Wipe: Dead file removal, cache cleanup, dependency vulnerability fixes, and resetting all MongoDB collections.
Video Call Removal: Complete removal of KITMeet/WebRTC/Jitsi integration.
Official Announcements Permissions: Restricting post creation in official notice channels to faculty (and admin) roles.
Dedicated Marketplace Module: First-class /marketplace page replacing r/Buy_Sell_Trade with structured listings, Verified Student badges, and a moderation queue.
Community Creation Requests: Student request flow + Faculty/Moderator approval queue & automated channel creation.
Campus Events & Hackathons Calendar: Centralized listing, interactive RSVPs, .ics calendar exports, and registration counts.
Campus Pulse Polls: Role/branch-gated polls with anti-tamper single-vote enforcement and live progress bars.
Official PDF Notice Generator: Faculty tool for institutional notices with letterhead, watermark seals, and verification QR codes.
Interim Auth Policy: Isolated domain-based role heuristic (@kitcoek.edu -> faculty, others -> student).
Please approve the plan or provide any feedback so I can proceed with the execution!