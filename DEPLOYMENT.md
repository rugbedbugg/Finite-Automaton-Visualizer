# 🚀 Deployment Guide

This guide covers deploying the Finite Automaton Visualizer with a split architecture:
- **Frontend**: Cloudflare Pages
- **Backend**: Fly.io (or Railway/Render)

---

## 📦 Architecture

```
┌─────────────────────┐
│  Cloudflare Pages   │  ← Frontend (React + Vite)
│  (Static Hosting)   │
└──────────┬──────────┘
           │ API calls
           ↓
┌─────────────────────┐
│      Fly.io         │  ← Backend (Rust + Actix-web)
│  (Server Hosting)   │
└─────────────────────┘
```

---

## 🔧 Step 1: Deploy Backend to Fly.io

### Prerequisites
- Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
- Sign up for Fly.io account

### Deploy Steps

```bash
# 1. Login to Fly.io
flyctl auth login

# 2. Launch the app (from project root)
flyctl launch

# Follow the prompts:
# - App name: finite-automaton-visualizer (or your choice)
# - Region: Choose closest to your users
# - PostgreSQL: No
# - Redis: No
# - Deploy now: Yes

# 3. Your backend will be deployed to:
# https://finite-automaton-visualizer.fly.dev
```

### Verify Backend

```bash
# Check if backend is running
curl https://YOUR-APP-NAME.fly.dev/health
# Should return: "Server is running"
```

---

## 🌐 Step 2: Deploy Frontend to Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Pages**: https://dash.cloudflare.com/pages
2. **Create a new project**
3. **Connect your GitHub repository**: `rugbedbugg/Finite-Automaton-Visualizer`
4. **Configure build settings**:

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `cd frontend && npm install && npm run build` |
| **Build output directory** | `frontend/dist` |
| **Root directory** | `/` |

5. **Add environment variable**:
   - Variable name: `VITE_API_URL`
   - Value: `https://YOUR-APP-NAME.fly.dev` (your backend URL from Step 1)

6. **Save and Deploy**

### Option B: Via Wrangler CLI

```bash
cd frontend

# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create .env.production
echo "VITE_API_URL=https://YOUR-APP-NAME.fly.dev" > .env.production

# Build and deploy
npm run build
wrangler pages deploy dist --project-name=finite-automaton-visualizer
```

---

## ✅ Step 3: Verify Deployment

1. **Test backend**: `https://YOUR-APP-NAME.fly.dev/health`
2. **Test frontend**: `https://finite-automaton-visualizer.pages.dev`
3. **Test full flow**: Create an NFA and convert to DFA

---

## 🔄 Alternative: Deploy Backend to Railway

If you prefer Railway over Fly.io:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up

# 5. Add environment variables in Railway dashboard
# HOST=0.0.0.0
# PORT=8080

# 6. Get your Railway URL and use it as VITE_API_URL
```

---

## 🔄 Alternative: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cargo build --release`
   - **Start Command**: `./target/release/Finite-Automaton-Visualizer`
   - **Environment Variables**:
     - `HOST=0.0.0.0`
     - `PORT=10000` (Render default)

---

## 🛠️ Local Development

```bash
# Terminal 1: Start backend
cargo run
# Backend runs on http://127.0.0.1:8080

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Or use the convenience script:

```bash
./run-dev.sh
```

---

## 📝 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://127.0.0.1:8080  # For local development
# VITE_API_URL=https://your-backend.fly.dev  # For production
```

### Backend

```env
HOST=0.0.0.0
PORT=8080
```

---

## 🐛 Troubleshooting

### CORS Issues

If you get CORS errors, ensure your backend allows the frontend domain:
- Backend already has `allow_any_origin()` configured
- Make sure both deployments use HTTPS in production

### Backend not responding

```bash
# Check Fly.io logs
flyctl logs

# Check app status
flyctl status
```

### Build failures on Cloudflare Pages

- Ensure `VITE_API_URL` is set in environment variables
- Check that build command includes `cd frontend`
- Verify output directory is `frontend/dist`

---

## 💰 Costs

- **Cloudflare Pages**: Free (500 builds/month)
- **Fly.io**: Free tier (3 shared VMs, auto-suspend when idle)
- **Railway**: $5/month after free trial
- **Render**: Free tier (auto-suspend after inactivity)

---

## 🔐 Security Notes

- Backend uses CORS to allow any origin (suitable for public API)
- No authentication required for conversion endpoints
- HTTPS enforced in production deployments
