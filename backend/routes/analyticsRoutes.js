import express from 'express';
import { getBusinessComparison } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/comparison', getBusinessComparison);

export default router;

