import { WebSocketServer, WebSocket } from 'ws';
import { addClientMessageServices, addUserMessageServices, sendWhatsappMessage, sendUnofficialWhatsapp, getChatForUserService } from '../services/chatServices.js';
import { deliverLeadToClient } from '../services/leadService.js';
import { subscriptionsMap } from '../routes/crm.js';
import config from '../config/config.js';
import { sendMessengerMessage } from '../routes/messengerRouter.js';
import { getChatByNickName, getChatForUser } from '../dao/chatDAO.js';

const userConnections = new Map();
const PING_INTERVAL = config.PING_INTERVAL_WS || 30000;

const pingAllConnections = () => {
    userConnections.forEach((connections, userEmail) => {
        connections.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping();
            }
        });
    });
};

export const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws, req) => {
        const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const userEmail = queryParams.get('userEmail');
        const origin = queryParams.get('origin');

        if (origin === "newChat") {
            const chat = (await getChatByNickName(userEmail)) || (await getChatForUser(userEmail));

            if (chat) {
                const initialChatData = {
                    type: "initialChat", 
                    messages: chat.messages,
                };

                ws.send(JSON.stringify(initialChatData)); 
            }
        }

        if (userEmail) {
            if (!userConnections.has(userEmail)) {
                userConnections.set(userEmail, []);
            }
            const connections = userConnections.get(userEmail);
            connections.push(ws);
            console.log(`Connection established for user: ${userEmail}`);

            ws.on('message', async (message) => {
                try {
                    const { text, selectedUser, type, image } = JSON.parse(message);

                    if (type !== 'lead') {

                        // Agregar validacion de fecha de ultimo mensaje del usuario seleccionado. selectedUser hay que obtener el ultimo mensaje enviado por el usuario para comparar 
                        // si la fecha es mayor a 24 horas

                        let chat = await addClientMessageServices(userEmail, selectedUser, text);

                        await sendMessengerMessage(selectedUser, { text }, chat.fanpageId);

                        const recipientConnections = userConnections.get(selectedUser) || [];
                        recipientConnections.forEach((recipientWs) => {
                            if (recipientWs.readyState === WebSocket.OPEN) {
                                recipientWs.send(JSON.stringify({ user: userEmail, text }));
                            }
                        });
                    } else {
                        let chat = await getChatByNickName(userEmail);
                        let imageBase64;
                        let audioUrl;
     
                        const to = chat?.client || selectedUser || (await deliverLeadToClient()).email;

                        await (selectedUser
                            ? addClientMessageServices(userEmail, selectedUser, text)
                            : addUserMessageServices(
                                userEmail,
                                to,
                                text,
                                image || null,
                                audioUrl,
                                undefined,
                                type
                            )
                        );


                        if (userConnections.has(to)) {
                            const recipientConnections = userConnections.get(to) || [];
                            recipientConnections.forEach(ws => {
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(JSON.stringify({ user: userEmail, textMessage: text, destination: userEmail, image: imageBase64, audioUrl }));
                                }
                            });
                        } else {
                            console.log('Enviando notificacion.')

                            const payload = JSON.stringify({
                                title: '¡Nuevo mensaje!',
                                body: 'Tienes un nuevo mensaje.',
                                icon: '/icon.png',
                            });

                            if (subscriptionsMap.has(to)) {
                                try {
                                    let subscription = subscriptionsMap.get(to);
                                    if (subscription) {
                                        await webPush.sendNotification(subscription, payload);
                                    }
                                } catch (error) {
                                    console.log(error);
                                    return res.status(404).json({ error: 'Suscripción no encontrada.' });
                                }
                            }
                        }

                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            });

            ws.on('close', () => {
                const connections = userConnections.get(userEmail) || [];
                const index = connections.indexOf(ws);
                if (index !== -1) {
                    connections.splice(index, 1);
                }
                if (connections.length === 0) {
                    userConnections.delete(userEmail);
                }
                console.log(`Connection closed for user: ${userEmail}`);
            });

            setInterval(pingAllConnections, PING_INTERVAL);

            ws.on('pong', () => {
                // console.log(`Pong received from ${userEmail}`);
            });

        } else {
            console.error('User email not provided in the query string');
            ws.close();
        }
    });

    return wss;
};

export { userConnections };