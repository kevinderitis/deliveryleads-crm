import { Router } from 'express';
import { getAll, updateClient, createClient, getData, updatePhone, updateClientState, updateUserPhone, setTelegramChatId, setTelegramChannelId,updateWelcomeMessage, getClientByTgId, getAdminPhones, updateUserNickname, updateUserPassword } from '../controllers/clientController.js';
import { isAuthenticated, isAdmin } from '../middleware/middleware.js';

const clientRouter = Router();

clientRouter.get('/', isAdmin, getAll);
clientRouter.get('/data/:tgchatid', getClientByTgId);
clientRouter.get('/data', isAuthenticated, getData);
clientRouter.post('/', createClient);
clientRouter.put('/:id/data', updateClient);
clientRouter.put('/phone', isAuthenticated, updatePhone);
clientRouter.put('/message/:email', isAuthenticated, updateWelcomeMessage);
clientRouter.put('/password/:username', isAuthenticated, isAdmin, updateUserPassword);
clientRouter.post('/user/phone', updateUserPhone);
clientRouter.post('/user/nickname', updateUserNickname);
clientRouter.put('/state', isAuthenticated, updateClientState);
clientRouter.post('/telegram', setTelegramChatId);
clientRouter.post('/telegram/channel', setTelegramChannelId);
clientRouter.get('/admin/phones', getAdminPhones);

export default clientRouter;
