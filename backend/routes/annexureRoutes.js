import express from 'express';
import { createAnnexure, getAnnexures } from '../controllers/annexureController.js';

const router = express.Router();

router.post('/', createAnnexure);
router.get('/', getAnnexures);

export default router;
