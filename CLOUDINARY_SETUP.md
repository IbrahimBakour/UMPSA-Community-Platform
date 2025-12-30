# Cloudinary Integration Plan - UMPSA Community Platform

## Overview

Migrate from local file storage to Cloudinary for production deployment on Render.

## Benefits

- ✅ Persistent storage (survives Render restarts)
- ✅ CDN delivery (faster image loading)
- ✅ Automatic image optimization
- ✅ Free tier: 25GB storage + 25GB bandwidth/month
- ✅ No local storage limitations

## Implementation Plan

### Phase 1: Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend
npm install cloudinary multer-storage-cloudinary
npm install --save-dev @types/multer-storage-cloudinary
```

#### 1.2 Create Cloudinary Config Module

File: `backend/src/config/cloudinary.ts`

Create this new file with:

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

#### 1.3 Update Environment Variables

Your `.env` should have:

```
CLOUDINARY_CLOUD_NAME=dkzwd6r6u
CLOUDINARY_API_KEY=872271278231174
CLOUDINARY_API_SECRET=gpjFD7ME8WszTaKfAjdTO34gHa4
```

Extract from your CLOUDINARY_URL if not already set.

#### 1.4 Update Upload Middleware

File: `backend/src/middlewares/upload.ts`

Replace multer diskStorage with CloudinaryStorage for:

- `profilePicture` → folder: `umpsa/profiles`
- `banner` → folder: `umpsa/banners`
- `postMedia` → folder: `umpsa/posts`

#### 1.5 Update Upload Controller

File: `backend/src/controllers/upload.ts`

Modify `uploadClubMedia` function to:

- Store Cloudinary URLs in database instead of local paths
- Handle Cloudinary response format
- Delete old files from Cloudinary (using public_id)
- Return Cloudinary URLs in response

#### 1.6 Update User Upload Controller

File: `backend/src/controllers/upload.ts`

Modify `uploadProfilePicture` function similarly.

### Phase 2: Frontend Updates

#### 2.1 No Major Changes Needed

Frontend should work as-is since we'll return proper URLs in API responses.

#### 2.2 Update Cache Busting (if needed)

In `frontend/src/components/ClubCard.tsx`, modify timestamp extraction:

- Cloudinary URLs don't have timestamps, they're already versioned
- Can add query param: `?auto=format&w=300` for optimization

#### 2.3 Test Image Loading

Verify all image endpoints:

- Club profile pictures
- Club banners
- Post media
- User profile pictures

### Phase 3: Database Migration (Optional)

If you want to migrate existing local files to Cloudinary:

1. Create a migration script
2. Read local files
3. Upload to Cloudinary
4. Update database with new URLs
5. Delete local files

For now, you can keep local uploads and new uploads go to Cloudinary.

### Phase 4: Environment Setup for Render

Set these environment variables in Render dashboard:

```
CLOUDINARY_CLOUD_NAME=dkzwd6r6u
CLOUDINARY_API_KEY=872271278231174
CLOUDINARY_API_SECRET=gpjFD7ME8WszTaKfAjdTO34gHa4
```

## File Structure Changes

### Old Structure (Local Storage)

```
/uploads
  /general/      → club media
  /profiles/     → user avatars
  /posts/        → post media
```

### New Structure (Cloudinary)

```
umpsa/
  /profiles/     → user avatars
  /banners/      → club banners
  /posts/        → post media
  /club-profiles/ → club profile pictures
```

## Detailed Implementation Files

### Files to Create

1. `backend/src/config/cloudinary.ts` - Cloudinary config
2. Optional: `backend/src/scripts/migrate-to-cloudinary.ts` - Migration script

### Files to Modify

1. `backend/src/middlewares/upload.ts` - Use CloudinaryStorage
2. `backend/src/controllers/upload.ts` - Handle Cloudinary responses
3. `backend/.env` - Add Cloudinary credentials
4. `backend/tsconfig.json` - Add types

### Files to Review

1. `frontend/src/components/ClubCard.tsx` - Image loading
2. `frontend/src/pages/ClubProfilePage.tsx` - Image display
3. All components displaying images

## Testing Checklist

- [ ] Upload club profile picture
- [ ] Upload club banner
- [ ] Upload post media
- [ ] Upload user profile picture
- [ ] Images display correctly from Cloudinary URLs
- [ ] Replace existing image (old file deleted)
- [ ] Database stores correct Cloudinary URLs
- [ ] Admin panel shows images correctly
- [ ] Test with different file types (jpg, png, gif)
- [ ] Test file size limits

## Rollback Plan

If issues occur:

1. Keep local `/uploads` folder accessible
2. Database still has old local paths
3. Update API to fallback to local if Cloudinary fails
4. Can revert to local storage quickly

## Timeline

- Phase 1 (Backend Setup): 1-2 hours
- Phase 2 (Frontend Updates): 30 mins
- Phase 3 (Testing): 1 hour
- Phase 4 (Render Deployment): 15 mins

**Total: 3-4 hours**

## References

- [Cloudinary Node.js Docs](https://cloudinary.com/documentation/node_integration)
- [Multer Cloudinary Storage](https://www.npmjs.com/package/multer-storage-cloudinary)
- [Render Environment Variables](https://render.com/docs/environment-variables)
