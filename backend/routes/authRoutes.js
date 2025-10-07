import express from 'express';
import { login, register, me, updateMe } from '../controllers/authController.js';
import upload from '../middleware/uploadImage.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);


// Profile update (PATCH /me)
router.patch('/me', requireAuth, updateMe);

// Profile picture upload
router.post('/upload-avatar', requireAuth, upload.single('avatar'), (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
	// Serve from /uploads/ relative to backend/public
	const url = `/uploads/${req.file.filename}`;
	res.json({ url });
});

export default router;


