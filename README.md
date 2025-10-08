# SpiceExpress 🚚

A modern logistics and courier management system built with React and Node.js.

## ✨ Features

- 📦 **Package Tracking System** - Real-time tracking with interactive UI
- 💰 **Instant Fare Calculator** - Zone-based pricing with weight calculations
- 🚚 **Delivery Management** - Complete logistics workflow
- 👥 **User Authentication** - Secure login/register system
- 📊 **Admin Dashboard** - Comprehensive analytics and reporting
- 🌍 **Multi-Zone Support** - Pan-India coverage with regional pricing
- 📱 **Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Lucide React** for icons
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📁 Project Structure

```
spiceexpress/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # API and utilities
│   │   └── assets/         # Static assets
│   ├── public/             # Public static files
│   ├── netlify.toml        # Netlify deployment config
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── routes/             # API route handlers
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── middleware/        # Custom middleware
│   ├── public/            # File uploads
│   ├── render.yaml        # Render deployment config
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

### Local Development Setup

1. **Clone and install dependencies:**
```bash
git clone https://github.com/vegadarsiwork/spiceexpress.git
cd spiceexpress

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

2. **Set up environment variables:**

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

3. **Start development servers:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🌐 Deployment

### Frontend (Netlify)
- **Live URL**: https://spiceexpress.netlify.app
- **Auto-deploy**: Triggered on push to main branch
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Backend (Render)
- **Live API**: https://spiceexpress-backend.onrender.com
- **Auto-deploy**: Triggered on push to main branch
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables for Production

**Netlify (Frontend):**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

**Render (Backend):**
```
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://spiceexpress.netlify.app
```

## 📊 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `GET /api/lr/track/:id` - Track shipment (no auth required)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints
- `GET /api/customers` - Get customers
- `POST /api/lr` - Create LR
- `GET /api/invoice` - Get invoices
- `GET /api/v1/analytics` - Analytics data

## 🎯 Key Features Explained

### Instant Fare Calculator
- **Zone-based Pricing**: 11 zones covering entire India
- **Weight-based Calculation**: Dynamic pricing based on package weight
- **Real-time Validation**: Prevents same pickup/drop selection
- **Modal Results**: Clean UI showing detailed cost breakdown

### Package Tracking
- **Public Access**: No login required for tracking
- **Real-time Updates**: Live status updates
- **Responsive Design**: Works on all devices

### User Management
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Different permissions for users
- **Profile Management**: Complete user profile system

## 🔧 Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
npm run dev          # Start with nodemon
npm start           # Start production server
npm test            # Run tests (when implemented)
```

## 🐛 Troubleshooting

### Common Issues

**Frontend build fails:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API connection issues:**
- Check if backend is running on correct port
- Verify CORS settings
- Check environment variables

**Database connection fails:**
- Verify MongoDB connection string
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vega Darsi**
- GitHub: [@vegadarsiwork](https://github.com/vegadarsiwork)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Render and Netlify for free hosting
- MongoDB Atlas for database hosting

---

**Made with ❤️ for modern logistics management**