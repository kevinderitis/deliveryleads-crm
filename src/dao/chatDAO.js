import Chat from "./models/chatModel.js";
import axios from 'axios';
import config from '../config/config.js';
import db from "./db.js";

export const addMessage = async (from, to, text, image) => {
    try {
        let chat = await Chat.findOne({ participants: { $all: [from, to] } });

        if (!chat) {
            chat = new Chat({ participants: [from, to], messages: [] });
        }

        chat.messages.push({ from, to, text, image });

        await chat.save();

        return chat;
    } catch (error) {
        throw new Error('Error adding message: ' + error.message);
    }
};

export const getMessagesForChat = async participants => {
    try {
        const chat = await Chat.findOne({ participants: { $all: participants } });

        if (!chat) {
            return [];
        }

        return chat.messages;
    } catch (error) {
        throw new Error('Error retrieving messages: ' + error.message);
    }
}

export const getMessagesForUser = async participants => {
    try {
        const chat = await Chat.findOne({ participants: { $in: participants } });

        if (!chat) {
            return [];
        }

        return chat.messages;
    } catch (error) {
        throw new Error('Error retrieving messages: ' + error.message);
    }
}

export const getChatForUser = async participants => {
    try {
        const chat = await Chat.findOne({ participants: { $in: participants } });
        return chat;
    } catch (error) {
        throw new Error('Error retrieving messages: ' + error.message);
    }
}

export const getUsersList = async email => {
    try {
        const chats = await Chat.find({ participants: email }).sort({ updatedAt: -1 });

        if (!chats.length) {
            return [];
        }

        const usersSet = new Set();
        chats.forEach(chat => {
            chat.participants.forEach(participant => {
                if (participant !== email) {
                    usersSet.add(participant);
                }
            });
        });

        return Array.from(usersSet);
    } catch (error) {
        throw new Error('Error retrieving user list: ' + error.message);
    }
}

export const sendMessageToClient = async (phone, message) => {
    try {
        const response = await axios.post(config.CLIENT_URL, {
            phone,
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}