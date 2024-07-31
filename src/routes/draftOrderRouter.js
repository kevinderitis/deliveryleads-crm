
import { Router } from 'express';
import { getAllDraftOrders, createDraftOrder, updateDraftOrder, approveOrder } from '../controllers/draftOrderController.js';
import { isAuthenticated, isAdmin } from '../middleware/middleware.js';

const draftOrderRouter = Router();

draftOrderRouter.use(isAuthenticated)

draftOrderRouter.get('/', getAllDraftOrders);
draftOrderRouter.post('/', createDraftOrder)
draftOrderRouter.put('/:id', updateDraftOrder);
draftOrderRouter.post('/approve/:id', isAdmin, approveOrder)

export default draftOrderRouter;
