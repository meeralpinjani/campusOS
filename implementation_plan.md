# Implementation Plan - Phase 2: Engagement & Interaction

Phase 2 builds user engagement and community interactivity on **CampusConnect**: upvote/downvote functionality with hot score decay, threaded nesting comments, post detail view with expanded media preview, and dynamic user reputation calculation.

---

## Technical Architectural Decisions & Explanation

1. **Voting Mechanism & Score Calculation**:
   - Store `upvotedBy` and `downvotedBy` user ID arrays directly in `Post` and `Comment` documents for atomic `$addToSet` and `$pull` Mongoose updates.
   - Prevent double-voting while allowing score toggle (upvote -> neutral -> downvote).
   - Recalculate `hotScore` using `calculateHotScore(upvotes, downvotes, createdAt)` on every vote action.
   - Adjust author's `reputationScore` in `User` model (+5 per upvote gained, -2 per downvote received).

2. **Threaded Comments Architecture**:
   - `Comment` schema supports adjacency list pattern via `parentCommentId` reference.
   - High performance fetching: `GET /api/posts/:postId/comments` populates author details (`username`, `avatarUrl`, `role`, `branch`) and transforms flat MongoDB array into nested tree structure on frontend or backend.
   - Post document keeps a counter `commentCount` incremented atomically via `$inc` on comment creation.

3. **Post Detail & Media Gallery**:
   - `PostDetailModal.jsx` renders high-resolution post details, interactive comment thread, and lightbox attachment previews for images, embedded HTML5 video player for videos, and PDF viewer link.

---

## User Review Required

> [!NOTE]
> **Reputation Scoring**: Upvoting increases author's reputation (+5 points), downvoting reduces author's reputation (-2 points), and adding comments awards +2 points.
> **Tree Depth**: Threaded replies will support up to 3 levels of visual indentation for clean mobile & desktop UX.

---

## Proposed Changes

### Server (`/server`)

#### [MODIFY] [Post.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/models/Post.js)
- Add `upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]`
- Add `downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]`
- Add `commentCount: { type: Number, default: 0 }`

#### [NEW] [Comment.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/models/Comment.js)
- Mongoose schema for post comments and replies (`postId`, `authorId`, `parentCommentId`, `content`, `upvotedBy`, `downvotedBy`, `score`, `isDeleted`, `createdAt`).

#### [NEW] [commentController.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/controllers/commentController.js)
- `getCommentsByPost`: Fetch comments for post and structure tree hierarchy.
- `createComment`: Create top-level comment or nested reply, increment `commentCount` on `Post`, award author reputation.
- `deleteComment`: Soft-delete or remove comment.
- `voteComment`: Upvote/downvote comment.

#### [MODIFY] [postController.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/controllers/postController.js)
- Add `votePost` controller method handling upvote/downvote toggles, hot score recalculation, and reputation score updates.

#### [NEW] [commentRoutes.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/routes/commentRoutes.js)
- Routes: `GET /api/posts/:postId/comments`, `POST /api/posts/:postId/comments`, `DELETE /api/comments/:commentId`, `POST /api/comments/:commentId/vote`.

#### [MODIFY] [postRoutes.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/routes/postRoutes.js)
- Add `POST /:id/vote` route protected by `protect` middleware.

#### [MODIFY] [index.js](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/server/index.js)
- Mount comment routes (`/api/comments` or under `/api/posts`).

---

### Client (`/client`)

#### [MODIFY] [PostCard.jsx](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/client/src/components/PostCard.jsx)
- Interactive vote buttons (Upvote/Downvote) with optimistic local state update & backend API sync.
- Comment count badge button to trigger post detail modal.

#### [NEW] [CommentSection.jsx](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/client/src/components/CommentSection.jsx)
- Top-level comment composer with user avatar & submit button.
- Tree rendering of parent and child comments.

#### [NEW] [CommentItem.jsx](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/client/src/components/CommentItem.jsx)
- Single comment card showing author badge, timestamp, content, inline vote buttons, reply button, and reply composer input.

#### [NEW] [PostDetailModal.jsx](file:///e:/Campus%20Connect%20%28Community%29-%20Antigravity/client/src/components/PostDetailModal.jsx)
- Full modal overlay displaying complete post, attachment lightbox, vote controls, and full `CommentSection`.

---

## Verification Plan

### Automated / API Verification
1. `POST /api/posts/:id/vote`:
   - Send `voteType: 'upvote'`, verify `upvotes` increases, `score` increases, `hotScore` recalculated, author reputation updated.
   - Send `voteType: 'upvote'` again, verify vote toggling (reset to 0).
   - Send `voteType: 'downvote'`, verify score updates correctly.
2. `POST /api/posts/:postId/comments`:
   - Create top-level comment. Check 201 response and incremented `commentCount` on post.
   - Create reply comment passing `parentCommentId`. Check child relationship in tree structure.
3. `GET /api/posts/:postId/comments`:
   - Verify tree response structure with populated author info.

### Manual Verification
1. Click Upvote button on a post card in Home feed — verify score updates instantly and button turns orange.
2. Click Comment button to open `PostDetailModal`.
3. Add a new comment and post a reply to an existing comment.
4. Verify comment count updates on the Post card in the main feed.
