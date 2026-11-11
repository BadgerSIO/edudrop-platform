# EduDrop Backend — Architecture & Security Invariants

Follow these guardrails whenever modifying routes, controllers, services, schemas, media handlers, or seed snapshots in `backend/`.

---

## 1. Authentication & JWT Identity Extraction
- [`verifyJWT`](file:///home/saad/Downloads/projects/naptech/sips/backend/src/app/middleware/verifyJWT.ts) sets authenticated identity on `res.locals.email` and `res.locals.user`. **Never** read `req.user` in controllers; read `res.locals.email || res.locals.user?.email`.
- Collection-wide admin routes (`GET /user`, `GET /notification/`, `GET /submissions`) must enforce `verifyAdmin` or `requireRole(...)`.
- Single-record user-scoped routes (`GET/PATCH/DELETE /notification/:id`, `PATCH /school-info/:id`, `/school-inbox/:id`) must verify ownership (`String(doc.user) === String(actor._id)` or `actor.role === "admin"`, returning `403 Forbidden` on mismatch).
- Never allow `role === "admin"` self-password-change (`auth.service.ts`), self-suspension, or admin suspension via user management APIs.

---

## 2. Seed Snapshots & `.lean()` Normalization
- [`seed.ts`](file:///home/saad/Downloads/projects/naptech/sips/backend/src/seed.ts) inserts JSON from `backend/seed/*.json` via `collection.insertMany()`, which **bypasses Mongoose schema defaults**, and `.lean()` queries also omit defaults.
- Every document in `backend/seed/*.json` must explicitly include canonical schema fields (`status`, `isDeleted`, `seen`, `read`, `user`, etc.).
- When reading with `.lean()` or building MongoDB filters, normalize missing legacy fields explicitly (e.g., `status || (isDeleted ? "archived" : "active")`) instead of relying on strict equality (`=== "active"`).

---

## 3. Image Upload & Media Lifecycle Invariants
- Never dump raw client uploads onto disk or allow `image/svg+xml` in `/uploads/*`. Use `multer.memoryStorage()` paired with [`processUploadedImages`](file:///home/saad/Downloads/projects/naptech/sips/backend/src/app/middleware/imageProcessor.ts) (`sharp` magic-byte verification, EXIF auto-orient + metadata stripping, bounding-box resize, `.webp` encoding).
- Always chain [`mediaCleanupHelper.ts`](file:///home/saad/Downloads/projects/naptech/sips/backend/src/helper/mediaCleanupHelper.ts) (`safeUnlinkUpload`, `computeRemovedUrls`) **after** MongoDB writes succeed.
- Use set-difference cleanup (`Old \ Retained`) on array fields like `SchoolInfo.gallery`; never delete by array index (which deletes active images when items are removed or reordered).

---

## 4. Non-Blocking Side Effects & Data Privacy
- Wrap post-mutation notifications and SMTP emails in non-blocking `try/catch` helpers (`NotificationService.createNotificationSafe`) so missing secondary accounts or mail errors never fail primary order, contact, or school transactions.
- Ensure Order/Invoice responses populate `schoolId` (`name`, `slug`, `contactNo`, `address`) cleanly without exposing donor PII to unauthorized roles.
