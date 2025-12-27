# UMPSA Community Platform - Render Deployment Guide

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub**: Push your code to a GitHub repository

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create a Cluster**:

   - Go to MongoDB Atlas dashboard
   - Click "Build a Database"
   - Choose **FREE** M0 tier
   - Select region closest to Singapore (for Render Singapore region)
   - Click "Create Cluster"

2. **Create Database User**:

   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `umpsa-admin` (or your choice)
   - Generate a secure password (save it!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**:

   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Render's dynamic IPs
   - Click "Confirm"

4. **Get Connection String**:
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://umpsa-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add your database name before the `?` (e.g., `/umpsa-community?`)
   - Final format: `mongodb+srv://username:password@cluster.mongodb.net/umpsa-community?retryWrites=true&w=majority`

---

## 🚀 Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Commit and Push**:

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services
   - Skip to Step 3 if this works

### Option B: Manual Setup

1. **Create Backend Web Service**:

   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Backend**:

   - **Name**: `umpsa-community-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" for each:

   | Key            | Value                                                                                             |
   | -------------- | ------------------------------------------------------------------------------------------------- |
   | `NODE_ENV`     | `production`                                                                                      |
   | `PORT`         | `10000`                                                                                           |
   | `MONGODB_URI`  | `mongodb+srv://username:password@cluster.mongodb.net/umpsa-community?retryWrites=true&w=majority` |
   | `JWT_SECRET`   | (Click "Generate" for random value)                                                               |
   | `FRONTEND_URL` | `https://umpsa-community.onrender.com` (will update after frontend deploy)                        |

4. **Create Service** → Wait for deployment (5-10 minutes)

5. **Note Your Backend URL**: Will be like `https://umpsa-community-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Render

1. **Create Static Site**:

   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Frontend**:

   - **Name**: `umpsa-community`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variable**:

   | Key                 | Value                                          |
   | ------------------- | ---------------------------------------------- |
   | `VITE_API_BASE_URL` | `https://umpsa-community-backend.onrender.com` |

4. **Configure Rewrites** (for React Router):

   - Scroll to "Redirects/Rewrites"
   - Add rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`

5. **Create Static Site** → Wait for deployment (3-5 minutes)

6. **Note Your Frontend URL**: Will be like `https://umpsa-community.onrender.com`

---

## 🔄 Step 4: Update Backend CORS

1. Go back to your **Backend Web Service** on Render
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   https://umpsa-community.onrender.com
   ```
4. Click "Save Changes" → Backend will redeploy

---

## 🗃️ Step 5: Seed Admin User (Optional)

1. In your backend service on Render, go to "Shell" tab
2. Run:
   ```bash
   npm run create-admin
   ```
   Or manually via MongoDB Atlas:
   - Go to your cluster → "Browse Collections"
   - Navigate to `umpsa-community` database → `users` collection
   - Find your user and update `role` field to `"admin"`

---

## ⚠️ Important Notes

### File Uploads on Render

**Issue**: Render's free tier uses **ephemeral storage** - uploaded files disappear on each deployment or service restart.

**Solutions**:

1. **Cloudinary (Recommended)**:

   - Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB storage, 25GB bandwidth/month)
   - Get your credentials from dashboard
   - Install in backend: `npm install cloudinary multer-storage-cloudinary`
   - Update your upload middleware to use Cloudinary

2. **AWS S3**:

   - More complex but production-ready
   - Requires AWS account and S3 bucket setup

3. **Keep Local Storage** (Not Recommended):
   - Files will be lost on redeploy
   - Only use for testing

### Free Tier Limitations

- **Backend**: Spins down after 15 minutes of inactivity (first request after sleep takes 30-50 seconds)
- **Frontend**: Always available, fast CDN delivery
- **Database**: MongoDB Atlas M0 is free forever (512MB storage, shared CPU)

---

## 🧪 Step 6: Test Your Deployment

1. **Visit your frontend URL**: `https://umpsa-community.onrender.com`
2. **Test features**:
   - Registration/Login
   - Create posts
   - Create clubs
   - Admin panel
   - File uploads (note: will be lost on redeploy with local storage)

---

## 🔍 Troubleshooting

### Backend won't start

- Check "Logs" tab in Render dashboard
- Verify `MONGODB_URI` is correct
- Ensure all environment variables are set

### Frontend can't connect to backend

- Check browser console for CORS errors
- Verify `VITE_API_BASE_URL` matches backend URL
- Verify `FRONTEND_URL` in backend matches frontend URL

### Database connection fails

- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string has correct password
- Check if database user exists

### 502 Bad Gateway

- Backend is likely sleeping (free tier)
- Wait 30-50 seconds and refresh
- Consider upgrading to paid plan for always-on

---

## 🎯 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed and healthy (`/api/health` returns 200)
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Admin user created
- [ ] Test all main features
- [ ] Set up custom domain (optional)
- [ ] Configure file upload service (Cloudinary/S3)
- [ ] Set up monitoring/logging (optional)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Node.js Integration](https://cloudinary.com/documentation/node_integration)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Render logs (Logs tab in service dashboard)
2. Check MongoDB Atlas metrics
3. Verify all environment variables
4. Test backend API directly with Postman/curl
5. Check browser console for frontend errors
