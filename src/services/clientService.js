import { getClientByEmail, updateClientById, updateWelcomeMessage, getClientByTelegram, updateUserNicknameByEmail, updateUserPassword } from "../dao/clientDAO.js";
import { getAdminPhones } from "../dao/userDAO.js";

export const getClientByEmailService = async email => {
    try {
        const client = await getClientByEmail(email)
        return client;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getClientByTelegramService = async tgchatid => {
    try {
        const client = await getClientByTelegram(tgchatid)
        return client;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const calculateTotalLeads = orders => {
    let totalQuantity = 0;

    orders.forEach((order) => {
        if (!order.delivered) {
            totalQuantity += order.quantity;
        }
    });

    return totalQuantity;
};

export const setTelegramChatIdService = async (userId, tgadmin) => {
    try {
        const response = await updateClientById(userId, { tgadmin })
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const setTelegramChannelIdService = async (userId, telegramChatId) => {
    try {
        const response = await updateClientById(userId, { tgchatid: telegramChatId })
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateWelcomeMessageService = async (email, welcomeMessage) => {
    try {
        const response = await updateWelcomeMessage(email, welcomeMessage);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateUserNicknameByEmailService = async (nickname, email) => {
    try {
        const response = await updateUserNicknameByEmail(email, nickname);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getAdminPhonesService = async (email, welcomeMessage) => {
    try {
        const response = await getAdminPhones();
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateUserPasswordService = async (email, newPassword) => {
    try {
        const response = await updateUserPassword(email, newPassword);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};