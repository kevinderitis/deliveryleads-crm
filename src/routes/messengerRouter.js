import { Router } from 'express';
import axios from 'axios';
const messengerRouter = Router();
import { getChatForUserService, addClientMessageServices, addUserMessageServices } from '../services/chatServices.js';
import { userConnections } from '../websocket/ws-handler.js';
import { WebSocket } from "ws";
import { deliverLeadToClient } from "../services/leadService.js";
import { pageAccessTokens } from '../config/pageAccessToken.js';

// const PAGE_ACCESS_TOKEN = process.env.MESSENGER_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;

export const sendMessengerMessage = async (recipientId, message, pageId) => {
    console.log(`PAGE ID = ${pageId}`);
    const PAGE_ACCESS_TOKEN = pageAccessTokens[pageId];

    if (!PAGE_ACCESS_TOKEN) {
        console.error(`No se encontró el token de acceso para la página ${pageId}`);
        return;
    }
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            {
                recipient: { id: recipientId },
                message,
            }
        );
        console.log('Mensaje enviado:', response.data);
    } catch (error) {
        console.error('Error enviando mensaje:', error.response.data);
    }
};

messengerRouter.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        for (const entry of body.entry) {
            const webhookEvent = entry.messaging[0];
            const fanpageId = entry.id;
            const senderId = webhookEvent.sender.id;
            let imageUrl;
            let audioUrl;

            if (webhookEvent.message && !webhookEvent.message.is_echo) {
                const message = webhookEvent.message;

                if (message.text) {
                    console.log('Mensaje de texto recibido:', message.text);
                    // await sendMessengerMessage(senderId, { text: 'Recibido tu mensaje' });
                }

                if (message.attachments && message.attachments[0].type === 'image') {
                    imageUrl = message.attachments[0].payload.url;
                    console.log('Imagen recibida:', imageUrl);
                }

                if (message.attachments && message.attachments[0].type === 'audio') {
                    audioUrl = message.attachments[0].payload.url;
                    console.log('Audio recibido:', audioUrl);
                }

                let to;
                let chat = await getChatForUserService(senderId);

                if (!chat) {
                    let client = await deliverLeadToClient();
                    to = client.email;
                }

                await addUserMessageServices(senderId, to, message.text, imageUrl, audioUrl, fanpageId);

                const recipientConnections = userConnections.get(to) || [];
                recipientConnections.forEach(ws => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ user: senderId, textMessage: message.text, destination: senderId, image: imageUrl, audioUrl }));
                    }
                });
            }
        }

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

messengerRouter.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

export default messengerRouter;