# SpiceExpress

A modern logistics and courier management system built with React and Node.js.

## Features

- 📦 Package tracking system
- 💰 Instant fare calculator
- 🚚 Delivery management
- 👥 User authentication
- 📊 Admin dashboard

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Mongoose ODM

## Project Structure

```
spiceexpress/
├── frontend/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── package.json
└── README.md
```

## Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spiceexpress.git
cd spiceexpress
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add required environment variables

5. Start development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## Deployment

- **Frontend**: Deployed on Netlify
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas

## Live URLs

- **Frontend**: https://spiceexpress.netlify.app
- **Backend API**: https://spiceexpress-backend.onrender.com

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.