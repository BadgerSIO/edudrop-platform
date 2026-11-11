---
name: edudrop-seed-and-verify
description: >-
  Runbook for validating EduDrop database seed snapshots, verifying referenced .webp assets on disk, safely re-seeding MongoDB, and running full-stack TypeScript and Next.js build checks. Use after modifying Mongoose schemas, seed/*.json files, upload paths, or before shipping changes.
---

# EduDrop Seed Validation & Full-Stack Verification

Follow these steps whenever `backend/seed/*.json`, Mongoose schemas, upload assets, or frontend/backend TypeScript modules change.

## Steps

1. **Validate Seed Snapshots & Referenced Assets**
   Run from the repository root to verify JSON syntax and confirm every `/uploads/*` and `/home/*` image path exists on disk:
   ```bash
   node -e '
   const fs = require("fs");
   const path = require("path");
   const seedDir = "backend/seed";
   for (const file of fs.readdirSync(seedDir).filter(f => f.endsWith(".json"))) {
     const raw = fs.readFileSync(path.join(seedDir, file), "utf8");
     const docs = JSON.parse(raw);
     const matches = [...raw.matchAll(/"(\/(?:uploads|home|images)\/[^"]+)"/g)].map(m => m[1]);
     for (const url of new Set(matches)) {
       const clean = url.replace(/^\//, "");
       const target = clean.startsWith("uploads/") ? path.join("backend", clean) : path.join("frontend/public", clean);
       if (!fs.existsSync(target)) throw new Error(`Missing seed asset ${target} referenced in ${file}`);
     }
     console.log(`OK ${file}: ${docs.length} docs, ${new Set(matches).size} unique assets`);
   }
   '
   ```

2. **Verify Upload Directory Optimization**
   Confirm no unoptimized legacy files (`.jpg`, `.jpeg`, `.png`, `.svg`) remain inside `backend/uploads/`:
   ```bash
   find backend/uploads -type f ! -name "*.webp"
   ```
   (Expected output: empty.)

3. **Build Backend & Re-Seed MongoDB (When Seed Changes Were Made)**
   Only run `npm run seed` when intentional seed reset is desired (it clears and re-inserts all 13 collections):
   ```bash
   cd backend && npm run build && npm run seed
   ```

4. **Typecheck & Build Frontend**
   ```bash
   cd frontend && npx next typegen && npx tsc --noEmit && npm run build
   ```
