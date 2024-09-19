import { WebSocketServer, WebSocket } from 'ws';
import { addClientMessageServices, addUserMessageServices ,sendWhatsappMessage, sendUnofficialWhatsapp, getChatForUserService } from '../services/chatServices.js';
import config from '../config/config.js';

const userConnections = new Map();
const PING_INTERVAL = config.PING_INTERVAL_WS || 30000;

export const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const userEmail = queryParams.get('userEmail');

        if (userEmail) {
            if (!userConnections.has(userEmail)) {
                userConnections.set(userEmail, []);
            }
            const connections = userConnections.get(userEmail);
            connections.push(ws);
            console.log(`Connection established for user: ${userEmail}`);

            ws.on('message', async (message) => {
                try {
                    const { text, selectedUser, type } = JSON.parse(message);

                    if (type !== 'lead') {
                        console.log(`Message from ${userEmail}: ${text} -> ${selectedUser}`);
                        await addClientMessageServices(userEmail, selectedUser, text);

                        if (selectedUser.endsWith('@c.us')) {
                            await sendUnofficialWhatsapp(selectedUser, text);
                        } else {
                            // await sendWhatsappMessage(selectedUser, text);
                        }


                        const recipientConnections = userConnections.get(selectedUser) || [];
                        recipientConnections.forEach((recipientWs) => {
                            if (recipientWs.readyState === WebSocket.OPEN) {
                                recipientWs.send(JSON.stringify({ user: userEmail, text }));
                            }
                        });
                    } else {
                        console.log(text)
                        console.log(userEmail);

                        let chat = await getChatForUserService(userEmail);
                        let imageBase64;
                        let audioUrl;
                        let to;

                        if (chat) {
                            to = chat.client;
                        } else {
                            let client = await deliverLeadToClient();
                            to = client.email;
                        }
                        await addUserMessageServices(userEmail, to, text, imageBase64, audioUrl);

                        const recipientConnections = userConnections.get(to) || [];
                        recipientConnections.forEach(ws => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ user: userEmail, textMessage: text, destination: userEmail, image: imageBase64, audioUrl }));
                            }
                        });
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

            const interval = setInterval(() => {
                if (ws.readyState === ws.OPEN) {
                    ws.ping();
                }
            }, PING_INTERVAL);

            ws.on('pong', () => {
                console.log(`Pong received from ${userEmail}`);
            });

            ws.on('close', () => {
                clearInterval(interval);
            });
        } else {
            console.error('User email not provided in the query string');
            ws.close();
        }
    });

    return wss;
};

export { userConnections };