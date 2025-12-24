# 🚀 Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Doctor Search"
   git branch -M main
   git remote add origin https://github.com/yourusername/ayursutra-doctor-search.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `DATABASE_URL`
     - `GEMINI_API_KEY`
     - `NODE_ENV=production`
   - Click "Deploy"

3. **Done!** Your API will be live at `https://your-project.vercel.app`

---

## Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Add environment variables
   - Deploy!

---

## Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add environment variables
   - Create Web Service

---

## Environment Variables for Production

Make sure to add these in your deployment platform:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSy...
NODE_ENV=production
PORT=3000
```

---

## Post-Deployment Checklist

- [ ] Test API endpoints: `/api/health`
- [ ] Test search functionality
- [ ] Verify database connection
- [ ] Check Gemini AI integration
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Monitor logs for errors

---

## API Endpoints (Production)

Once deployed, your API will be available at:

- **Search**: `POST https://your-domain.com/api/search-doctors`
- **Specializations**: `GET https://your-domain.com/api/specializations`
- **Doctor Details**: `GET https://your-domain.com/api/doctors/:id`
- **Health Check**: `GET https://your-domain.com/api/health`

---

## Updating Your Deployment

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push origin main
```

Vercel/Railway/Render will automatically redeploy!

---

## Monitoring & Logs

### Vercel
- Go to your project dashboard
- Click "Deployments"
- View logs for each deployment

### Railway
- Open your project
- Click "Deployments"
- View real-time logs

### Render
- Open your service
- Click "Logs" tab
- Monitor in real-time

---

## Performance Tips

1. **Enable Caching**
   - Cache specializations list
   - Cache doctor profiles

2. **Database Optimization**
   - Ensure indexes are created (already in schema)
   - Use connection pooling

3. **API Rate Limiting**
   - Implement rate limiting for production
   - Protect against abuse

4. **CDN for Static Assets**
   - Use Vercel's CDN automatically
   - Or configure Cloudflare

---

## Security Checklist

- [ ] Environment variables are secure
- [ ] Database has Row Level Security enabled
- [ ] API endpoints validate input
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] Sensitive data is not logged

---

Happy deploying! 🎉
