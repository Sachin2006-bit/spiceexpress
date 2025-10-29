import express from 'express';
import { getAllCustomers, createCustomer, getCustomerSummary, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/', getAllCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.get('/:id/summary', getCustomerSummary);

export default router;
