import { Router } from "express";
import config from "../config/config.js";
import { userConnections } from '../websocket/ws-handler.js';
import { WebSocket } from "ws";
import { addMessageServices, getChatForUserService, getUsersListService, getMessagesForUserService } from '../services/chatServices.js';
import { deliverLeadToClient } from "../services/leadService.js";
import { isAuthenticated } from "../middleware/middleware.js";
import { addTagToChatByParticipant } from "../dao/chatDAO.js";
import axios from "axios";

const crmRouter = Router();

crmRouter.get('/', isAuthenticated, (req, res) => {
    res.sendFile('chat.html', { root: 'public' });
});

crmRouter.post('/new', async (req, res) => {
    const { from, text, image } = req.body;
    let to;

    try {
        let chat = await getChatForUserService(from);

        if (chat) {
            to = chat.participants.find(participant => participant !== from);
        } else {
            let client = await deliverLeadToClient();
            to = client.email;
        }

        await addMessageServices(from, to, text, image);

        const recipientConnections = userConnections.get(to) || [];

        if (recipientConnections.length > 0) {
            recipientConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ user: from, text, destination: from }));
                }
            });
            res.status(200).send('Message sent to all connections');
        } else {
            res.status(404).send('No connections found for the recipient');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).send('Internal Server Error');
    }
});

crmRouter.post('/receive', isAuthenticated, async (req, res) => {
    const { from, text, image } = req.body;
    let to;

    try {
        let chat = await getChatForUserService(from);

        if (chat) {
            to = chat.participants.find(participant => participant !== from);
        } else {
            let client = await deliverLeadToClient();
            to = client.email;
        }

        await addMessageServices(from, to, text, image);

        const recipientConnections = userConnections.get(to) || [];

        if (recipientConnections.length > 0) {
            recipientConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ user: from, text, destination: from }));
                }
            });
            res.status(200).send('Message sent to all connections');
        } else {
            res.status(404).send('No connections found for the recipient');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).send('Internal Server Error');
    }
});

crmRouter.get('/users/list/:email', isAuthenticated, async (req, res) => {
    let email = req.params.email;
    try {
        let userList = await getUsersListService(email);
        res.send(userList)
    } catch (error) {
        res.send('No se pudo obtener lista')
    }
});

crmRouter.get('/chats/:selected', isAuthenticated, async (req, res) => {
    let selectedUser = req.params.selected;
    let chat = await getMessagesForUserService(selectedUser);
    res.send(chat);
});

crmRouter.get('/tags/add/:number/:tag', isAuthenticated, async (req, res) => {
    let chatId = req.params.number;
    let tag = req.params.tag;
    let response = await addTagToChatByParticipant(chatId, tag);
    res.send(response);
});

crmRouter.get('/tags/remove/:number/:tag', isAuthenticated, async (req, res) => {
    let chatId = req.params.number;
    let tag = req.params.tag;
    let response = await removeTagFromChatByParticipant(chatId, tag);
    res.send(response);
});

const getImageBase64 = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`
            }
        });
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        return base64;
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};

crmRouter.post('/webhook', async (req, res) => {
    const body = req.body;
    try {
        if (body.object) {
            body.entry.forEach(entry => {
                entry.changes.forEach(async change => {
                    if (change.field === 'messages') {
                        const message = change.value.messages && change.value.messages[0];
                        const recipientPhoneId = change.value.metadata.phone_number_id;
                        if (message) {
                            let textMessage = message.text?.body || '';
                            let imageBase64;

                            console.log(`Numero de telefono: ${message.from}`)
                            console.log(`Mensaje: ${textMessage}`)

                            if (message.image) {
                                // const imageUrl = message.image.url;
                                // imageBase64 = await getImageBase64(imageUrl);
                                textMessage = 'IMAGEN';
                            } else if (message.audio) {
                                // const audioUrl = message.audio.url;
                                textMessage = 'AUDIO';
                            }

                            let to;

                            let chat = await getChatForUserService(message.from);

                            if (chat) {
                                to = chat.participants.filter(participant => participant !== message.from)[0];
                            } else {
                                let client = await deliverLeadToClient();
                                to = client.email;
                            }

                            await addMessageServices(message.from, to, textMessage, imageBase64);

                            const recipientConnections = userConnections.get(to) || [];

                            if (recipientConnections.length > 0) {
                                recipientConnections.forEach(ws => {
                                    if (ws.readyState === WebSocket.OPEN) {
                                        ws.send(JSON.stringify({ user: from, text, destination: from }));
                                    }
                                });
                            }
                        }
                    }
                });
            });

            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

});

crmRouter.get('/webhook', async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

export default crmRouter;