import { Router } from 'express';
import { getAll, updateLead, createLead, deliverLead } from '../controllers/leadController.js';

const leadRouter = Router();

leadRouter.get('/', getAll);
leadRouter.post('/', createLead)
leadRouter.get('/deliver', deliverLead)
leadRouter.put('/:id', updateLead);

export default leadRouter;
