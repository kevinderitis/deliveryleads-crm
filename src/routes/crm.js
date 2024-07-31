import { Router } from "express";
import { userConnections } from '../websocket/ws-handler.js';
import { WebSocket } from "ws";
import { addMessageServices, getChatForUserService, getUsersListService, getMessagesForUserService } from '../services/chatServices.js'; 
import { deliverLeadToClient } from "../services/leadService.js";
import { isAuthenticated } from "../middleware/middleware.js";

const crmRouter = Router();

crmRouter.use(isAuthenticated);

crmRouter.get('/', (req, res) => {
    res.sendFile('chat.html', { root: 'public' });
});

crmRouter.post('/receive', async (req, res) => {
    const { from, text, image } = req.body;
    let to;

    let chat = await getChatForUserService(from);

    if (chat) {
        to = chat.participants.filter(participant => participant !== from)[0];
    } else {
        let client = await deliverLeadToClient();
        to = client.email;
    }

    await addMessageServices(from, to, text, image);

    const ws = userConnections.get(to);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ user: from, text, destination: from }));
        res.status(200).send('Message sent');
    } else {
        res.status(404).send('User not connected or WebSocket not open');
    }
});

crmRouter.get('/users/list/:email', async (req, res) => {
    let email = req.params.email;
    try {
        let userList = await getUsersListService(email);
        res.send(userList)
    } catch (error) {
        res.send('No se pudo obtener lista')
    }
});

crmRouter.get('/chats/:selected', async (req, res) => {
    let selectedUser = req.params.selected;
    let messages = await getMessagesForUserService(selectedUser);
    res.send(messages);
});

export default crmRouter;