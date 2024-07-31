import { Router } from 'express';
import { getAll, createOrder, updateOrder, stopOrder, stopOrderByTelegram, deleteOrder, activateOrder, activateOrderByTelegram } from '../controllers/orderController.js';
import { isAuthenticated, isAdmin } from '../middleware/middleware.js';

const orderRouter = Router();

// orderRouter.use(isAuthenticated)

orderRouter.get('/', isAuthenticated, getAll);
orderRouter.post('/', isAdmin, createOrder)
orderRouter.put('/:id', isAuthenticated, isAuthenticated, updateOrder);
orderRouter.put('/stop/:id', isAuthenticated, stopOrder);
orderRouter.post('/user/stop', stopOrderByTelegram);
orderRouter.post('/user/start', activateOrderByTelegram);
orderRouter.put('/activate/:id', isAuthenticated, activateOrder);
orderRouter.delete('/:id', isAuthenticated, deleteOrder);

export default orderRouter;
