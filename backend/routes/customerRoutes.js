import express from 'express';
import { getAllCustomers, createCustomer, getCustomerSummary } from '../controllers/customerController.js';

const router = express.Router();


import { getCustomerById, updateCustomer } from '../controllers/customerController.js';

router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.get('/:id/summary', getCustomerSummary);

export default router;
