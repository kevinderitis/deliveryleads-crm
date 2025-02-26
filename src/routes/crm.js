import { Router } from "express";
import config from "../config/config.js";
import { userConnections } from '../websocket/ws-handler.js';
import { WebSocket } from "ws";
import { addClientMessageServices, getChatForUserService, getUsersListService, getMessagesForUserService, getUsersFilteredListService, addUserMessageServices } from '../services/chatServices.js';
import { deliverLeadToClient } from "../services/leadService.js";
import { isAuthenticated } from "../middleware/middleware.js";
import { addTagToChatByParticipant, changeNickname, deleteChatByUser, removeTagFromChatByParticipant, savePhoneNumber, saveUserEmail, getReportData, calculateAverageResponseTime } from "../dao/chatDAO.js";
import { createNewPayment, getPaymentReportData } from "../dao/paymentDAO.js";
import axios from "axios";
import webPush from 'web-push';
import { getDefaultConfig, updateWhatsapp } from "../dao/configDAO.js";

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
            to = chat.username;
        } else {
            let client = await deliverLeadToClient();
            to = client.email;
        }

        await addUserMessageServices(from, to, text, image);

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

        await addClientMessageServices(from, to, text, image);

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

crmRouter.get('/users/list/:email/:filter/:page', isAuthenticated, async (req, res) => {
    let email = req.params.email;
    let filter = req.params.filter;
    let page = req.params.page;
    let response = {};
    try {
        let userList = await getUsersFilteredListService(email, filter, page);
        response.list = userList.chats;
        response.pages = Math.ceil(userList.total / 100);

        res.send(response)
    } catch (error) {
        res.send('No se pudo obtener lista')
    }
});

crmRouter.get('/chats/:selected', isAuthenticated, async (req, res) => {
    let selectedUser = req.params.selected;
    let limit = req.query.limit;

    let chat = await getMessagesForUserService(selectedUser, limit);
    res.send(chat);
});

crmRouter.get('/nickname/:nickname/:user', isAuthenticated, async (req, res) => {
    let nickName = req.params.nickname;
    let userId = req.params.user;
    let response = await changeNickname(nickName, userId);
    res.send(response);
});

crmRouter.get('/phone/:number/:user', isAuthenticated, async (req, res) => {
    let phoneNumber = req.params.number;
    let userId = req.params.user;
    let response = await savePhoneNumber(phoneNumber, userId);
    res.send(response);
});

crmRouter.get('/email/:email/:user', isAuthenticated, async (req, res) => {
    let email = req.params.email;
    let userId = req.params.user;
    let response = await saveUserEmail(email, userId);
    res.send(response);
});

crmRouter.get('/nickname/:nickname/:user/:password', isAuthenticated, async (req, res) => {
    let nickName = req.params.nickname;
    let userId = req.params.user;
    let password = req.params.password;
    let response = await changeNickname(nickName, userId, password);
    res.send(response);
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

crmRouter.delete('/delete/chat/:username', isAuthenticated, async (req, res) => {
    let username = req.params.username;
    try {
        let response = await deleteChatByUser(username)
        res.status(200).send({ message: 'Chat eliminado exitosamente', response });
    } catch (error) {
        console.error('Error al eliminar el chat:', error);
        res.status(500).send({ message: 'Hubo un problema al eliminar el chat', error: error.message });
    }
});


crmRouter.post('/report', isAuthenticated, async (req, res) => {
    const { startDate, endDate } = req.body;
    const client = req.session.user;

    try {
        const leadsData = await getReportData(client.email, startDate, endDate);
        const payments = await getPaymentReportData(client.email, startDate, endDate);
        const averageResponseTime = await calculateAverageResponseTime(client.email, startDate, endDate);

        const formattedDataLeads = leadsData.reduce((acc, item) => {
            acc[item.date] = item.count;
            return acc;
        }, {});

        let totalAmount = 0;
        const formattedDataPayments = payments.reduce((acc, item) => {
            acc[item.date] = item.paymentCount;
            totalAmount += item.totalAmount;
            return acc;
        }, {});

        const reportData = {
            leads: formattedDataLeads,
            payments: formattedDataPayments,
            totalAmount,
            averageResponseTime
        };

        res.status(200).send(reportData);
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        res.status(500).send({ message: 'Hubo un problema al obtener el reporte', error: error.message });
    }
});

crmRouter.post('/payment', async (req, res) => {
    let client = req.session.user;
    try {
        const { amount, userId } = req.body;

        if (!amount || amount <= 0 || !userId) {
            return res.status(400).json({ message: 'Datos de pago inválidos' });
        }

        await createNewPayment(userId, client.email, amount);

        res.status(200).json({ message: 'Pago recibido correctamente' });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ message: 'Error al procesar el pago' });
    }
});


const getImageBase64 = async (imageId) => {
    const url = `${config.WHATSAPP_API_URL}/${imageId}`;

    try {
        const response = await axios.get(url, {
            responseType: 'json',
            headers: {
                Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`
            }
        });

        const imageUrl = response.data.url;

        if (!imageUrl) {
            throw new Error('No image URL found in response.');
        }

        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`
            }
        });

        const base64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
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

                            if (message.image) {
                                const imageId = message.image.id;
                                imageBase64 = await getImageBase64(imageId);
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
                            await addClientMessageServices(message.from, to, textMessage, imageBase64);

                            const recipientConnections = userConnections.get(to) || [];

                            if (recipientConnections.length > 0) {
                                recipientConnections.forEach(ws => {
                                    if (ws.readyState === WebSocket.OPEN) {
                                        ws.send(JSON.stringify({ user: message.from, textMessage, destination: message.from, image: imageBase64 }));
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

const publicVapidKey = config.VAPID_PUBLIC;
const privateVapidKey = config.VAPID_PRIVATE;

export const subscriptionsMap = new Map();

webPush.setVapidDetails('mailto:tu-email@example.com', publicVapidKey, privateVapidKey);

crmRouter.post('/subscribe', (req, res) => {
    const subscription = req.body.subscription;
    const user = req.body.user;

    subscriptionsMap.set(user, subscription);

    res.status(201).json({});
});

crmRouter.post('/subscription/send', async (req, res) => {
    const user = req.body.user;
    const payload = req.body.payload;
    const subscription = subscriptionsMap.get(user);

    try {
        if (subscription) {
            await webPush.sendNotification(subscription, payload);
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: 'Suscripción no encontrada.' });
    }

    res.status(201).json({ msg: 'Sent' });
});

crmRouter.get('/whatsapp/:number', isAuthenticated, async (req, res) => {
    let phoneNumber = req.params.number;
    let response = await updateWhatsapp(phoneNumber);
    res.send(response);
});

crmRouter.get('/whatsapp', async (req, res) => {
    let config = await getDefaultConfig();
    res.send({ whatsapp: config.whatsapp });
});

export default crmRouter;