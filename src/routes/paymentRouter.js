import { Router } from 'express';
import { newPayment } from '../controllers/paymentController.js';

const paymentRouter = Router();

paymentRouter.post('/', newPayment)

export default paymentRouter;
