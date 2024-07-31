// import { addMessage, getMessagesForChat, getMessagesForUser, getChatForUser, getUsersList, sendMessageToClient } from "../dao/chatDao.js";

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