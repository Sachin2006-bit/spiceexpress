import express from 'express';
import { getCustomerMIS } from '../controllers/misController.js';

const router = express.Router();

router.get('/summary/:customerId', getCustomerMIS);

export default router;
