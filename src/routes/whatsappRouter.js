import pkg from 'whatsapp-web.js';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addClientMessageServices, getChatForUserService, getUsersListService, getMessagesForUserService, getUsersFilteredListService, saveAudio } from '../services/chatServices.js';
import { userConnections } from '../websocket/ws-handler.js';
import { WebSocket } from "ws";
import { deliverLeadToClient } from "../services/leadService.js";

const { Client, LocalAuth } = pkg;
const whatsappRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client = new Client({
    authStrategy: new LocalAuth({ clientId: `client-0206`}),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        // executablePath: process.env.CHROME_BIN || null
    },
    webVersionCache: {
        type: "remote",
        remotePath:
            "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014587000-alpha.html",
    },
});

let qrData;

export const initializeClient = () => {
    client.on('qr', async (qr) => {
        qrData = qr;
        console.log(`Este es la data de qr: ${qrData}`);
    });

    client.on('ready', async () => {
        console.log('Client is ready!');
    });

    client.on('disconnected', async (reason) => {
        console.log('Cliente desconectado:', reason);
    });

    client.on('message', async (message) => {
        try {
            const messageId = message.id._serialized;
            const messageText = message.body;
            const sender = message.from;
    
            console.log(`Numero de telefono: ${sender}`);
            console.log(`Mensaje: ${messageText}`);
    
            let imageBase64;
            let audioUrl;
            let textMessage = messageText;
    
            if (message.hasMedia) {
                const media = await message.downloadMedia();
                if (media.mimetype.startsWith('image')) {
                    imageBase64 = media.data;
                    textMessage = 'IMAGEN';
                } else if (media.mimetype.startsWith('audio')) {
                    audioUrl = await saveAudio(media.data, media.mimetype);
                    textMessage = 'AUDIO';
                }
            }
    
            let to;
            let chat = await getChatForUserService(sender);
    
            if (chat) {
                to = chat.participants.filter(participant => participant !== sender)[0];
            } else {
                let client = await deliverLeadToClient();
                to = client.email;
            }
            await addClientMessageServices(sender, to, textMessage, imageBase64, audioUrl);
    
            const recipientConnections = userConnections.get(to) || [];
            recipientConnections.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ user: sender, textMessage, destination: sender, image: imageBase64, audioUrl }));
                }
            });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }); 

    client.initialize();
};

export const sendMessageUnofficial = async (to, message, mediaUrl) => {
    try {
        if (!to || !message) {
            throw new Error('El destinatario y el mensaje son obligatorios.');
        }
        
        if (mediaUrl) {
            const mediaData = await fetch(mediaUrl).then(response => response.buffer());
            const base64 = mediaData.toString('base64');
            const mimeType = 'image/jpeg'; 

            const mediaMessage = new MessageMedia(mimeType, base64);
            
            await client.sendMessage(to, mediaMessage, { caption: message });
        } else {
            await client.sendMessage(to, message);
        }
        
        console.log('Mensaje enviado con éxito.');
    } catch (error) {
        console.error('Error enviando el mensaje:', error);
    }
};

whatsappRouter.get('/qr', async (req, res) => {
    try {
        res.render('qr-code', { qrText: qrData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating QR code');
    }
});

whatsappRouter.get('/shutdown', async (req, res) => {
    try {
        await client.destroy();
        console.log('Client has been shut down');
        initializeClient();
        console.log('Client has been restarted');
        res.send('Client has been restarted');
    } catch (error) {
        console.error('Error shutting down client:', error);
        res.status(500).send('Error shutting down client');
    }
});

export default whatsappRouter;