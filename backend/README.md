# Spice Express Backend - Deployment Guide

## Deploy to Render

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory as root directory

3. **Configure Service**:
   - **Name**: `spiceexpress-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://vegadarsiwork:vega@cluster0.p2ruof7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this
   FRONTEND_URL=https://your-netlify-url.netlify.app
   ```

5. **Update FRONTEND_URL**: After deploying frontend, update this with your actual Netlify URL

## API Endpoints

- **Health Check**: `GET /health`
- **Root**: `GET /`
- **Public Tracking**: `GET /api/lr/track/:id` (no auth required)
- **All other endpoints**: Require authentication

## Local Development

```bash
npm install
npm run dev
```

## Production Features

- ✅ CORS configured for production
- ✅ Health check endpoint
- ✅ Public tracking endpoint
- ✅ Environment-based configuration
- ✅ MongoDB connection
- ✅ Static file serving
