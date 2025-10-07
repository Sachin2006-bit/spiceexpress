
import express from 'express';
import { createLR, getLRs, getLrCount, getLRById, downloadLR, updateLR, deleteLR } from '../controllers/lrController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/uploadImage.js';

const router = express.Router();

// Public tracking route - no authentication required
router.get('/track/:id', getLRById);
router.get('/:id', getLRById);  // Keep for backward compatibility

// Accept multipart/form-data for image upload
// All other LR routes require authentication
router.post('/', requireAuth, upload.fields([
  { name: 'senderProfileImage', maxCount: 1 },
  { name: 'receiverProfileImage', maxCount: 1 }
]), createLR);
router.get('/', requireAuth, getLRs);
router.get('/count', requireAuth, getLrCount);
router.get('/:id/download', requireAuth, downloadLR);
router.get('/:id', requireAuth, getLRById);
router.put('/:id', requireAuth, updateLR);
router.delete('/:id', requireAuth, deleteLR);

export default router;
