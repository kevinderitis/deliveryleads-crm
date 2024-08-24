import { addMessage, getMessagesForChat, getMessagesForUser, getChatForUser, getUsersList, sendMessageToClient } from "../dao/chatDAO.js";
import axios from 'axios';
import config from "../config/config.js";

export const addMessageServices = async (from, to, text, image) => {
    try {
        await addMessage(from, to, text, image);
    } catch (error) {
        console.log(error);
    }
}

export const getMessagesForChatService = async (from, to) => {
    try {
        let response = await getMessagesForChat([from, to]);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getMessagesForUserService = async (user) => {
    try {
        let response = await getMessagesForUser([user]);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getChatForUserService = async (user) => {
    try {
        let response = await getChatForUser([user]);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export const getUsersListService = async (email) => {
    try {
        let response = await getUsersList(email);
        return response;
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