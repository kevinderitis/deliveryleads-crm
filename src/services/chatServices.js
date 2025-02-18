import { addMessage, addUserMessage ,getMessagesForChat, getMessagesForUser, getChatForUserByClient, getUsersList, sendMessageToClient, getFilteredUsersList } from "../dao/chatDAO.js";
import { sendMessageUnofficial } from "../routes/whatsappRouter.js";
import { userConnections } from "../websocket/ws-handler.js";
import axios from 'axios';
import config from "../config/config.js";
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const addClientMessageServices = async (from, to, text, image, audioUrl) => {
    try {
       const chat = await addMessage(from, to, text, image, audioUrl);
       return chat;
    } catch (error) {
        console.log(error);
    }
}

export const addUserMessageServices = async (from, to, text, image, audioUrl, fanpageId, type) => {
    try {
        await addUserMessage(from, to, text, image, audioUrl, fanpageId, type);
    } catch (error) {
        console.log(error);
    }
}

export const getMessagesForChatService = async (from, to) => {
    try {
        // let response = await getMessagesForChat([from, to]);
        let response = await getMessagesForChat(from, to);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getMessagesForUserService = async (user, limit) => {
    try {
        // let response = await getMessagesForUser([user]);
        let response = await getMessagesForUser(user, limit);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getChatForUserService = async (user) => {
    try {
        // let response = await getChatForUser([user]);
        let response = await getChatForUserByClient(user);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getUsersListService = async (email) => {
    try {
        let response = await getUsersList(email);

        const usersWithOnlineStatus = response.map(user => ({
            ...user._doc, 
            online: userConnections.has(user.username) 
        }));

        return usersWithOnlineStatus;
    } catch (error) {
        console.log(error);
    }
}

export const getUsersFilteredListService = async (email, filter, page = 1) => {
    try {
        const limit = 100;
        const offset = (page - 1) * limit;

        let response = await getFilteredUsersList(email, filter, limit, offset);

        const chats = response.chats.map(user => ({
            ...user._doc, 
            online: userConnections.has(user.email) 
        }));

        return { chats, total: response.total };
    } catch (error) {
        console.log(error);
    }
}

export const sendMessageToClientService = async (phone, message) => {
    try {
        let response = await sendMessageToClient(phone, message);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

export const sendWhatsappMessage = async (to, text) => {
    try {
        const response = await axios.post(`${config.WHATSAPP_API_URL}/${config.PHONE_ID}/messages`, {
            messaging_product: 'whatsapp',
            to: to,
            text: { body: text }
        }, {
            headers: {
                'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(response)
        console.log(`Message sent to: ${to}`);
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const sendUnofficialWhatsapp = async (to, text) => {
    try {
        await sendMessageUnofficial(to, text);
        console.log(`Message sent to: ${to}`);
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

const AUDIO_DIR = path.resolve('./public/audios');

function generateShortId() {
    return crypto.randomBytes(8).toString('hex'); 
}

export async function saveAudio(audioData, fileName) {
    const shortId = generateShortId(); 
    const fileExtension = path.extname(fileName) || '.mp3'; 
    const safeFileName = `${shortId}${fileExtension}`; 

    const filePath = path.join(AUDIO_DIR, safeFileName);

    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(audioData, 'base64'));
    console.log(`Audio saved to ${filePath}`);

    return safeFileName;
}
// export const sendWelcomeMessage = async (to) => {
//     try {
//         const response = await axios.post(`${config.WHATSAPP_API_URL}/${config.PHONE_ID}/messages`, {
//             messaging_product: 'whatsapp',
//             to,
//             type: 'template',
//             template: {
//               name: 'promo_leads',
//               language: { code: 'es_AR' },
//               components: [
//                 {
//                   type: 'header',
//                   parameters: [
//                     {
//                       type: 'image',
//                       image: { link: 'https://img.freepik.com/fotos-premium/perro-mirando-caer-billetes-dinero_639249-265.jpg' }
//                     }
//                   ]
//                 }
//               ]
//             }
//           }, {
//             headers: {
//                 'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         console.log(response)
//         console.log(`Message sent to: ${to}`);
//     } catch (error) {
//         console.error('Error sending message:', error);
//         throw error;
//     }
// };