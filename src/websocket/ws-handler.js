import { WebSocketServer } from 'ws';
import { addMessageServices, sendMessageToClientService, sendWhatsappMessage } from '../services/chatServices.js';
import config from '../config/config.js';

const userConnections = new Map();
const PING_INTERVAL = config.PING_INTERVAL_WS || 30000;

export const setupWebSocketServer = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
        const userEmail = queryParams.get('userEmail');

        if (userEmail) {
            userConnections.set(userEmail, ws);
            console.log(`Connection established for user: ${userEmail}`);

            ws.on('message', async (message) => {
                try {
                    const { text, selectedUser } = JSON.parse(message);

                    if (text) {
                        console.log(`Message from ${userEmail}: ${text} -> ${selectedUser}`);
                        await addMessageServices(userEmail, selectedUser, text);
                        await sendWhatsappMessage(selectedUser, text);
                        const recipient = userConnections.get(selectedUser);
                        if (recipient && recipient.readyState === WebSocket.OPEN) {
                            recipient.send(JSON.stringify({ user: userEmail, text }));
                        }
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            });

            ws.on('close', () => {
                userConnections.delete(userEmail);
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