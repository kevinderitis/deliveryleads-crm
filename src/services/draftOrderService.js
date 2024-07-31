import { getAllDraftOrders, updateDraftOrderById, createNewDraftOrder, getDraftOrdersByClientEmail, getDraftOrderByMongoId } from "../dao/draftOrderDAO.js";
import { createOrderService } from "./orderService.js";
import { getClientByEmailService } from './clientService.js';

export const createDraftOrderService = async (quantity, email) => {
    try {
        const client = await getClientByEmailService(email);

        if (!client) {
            throw new Error('El cliente con el correo electrónico proporcionado no existe');
        };
        const response = await createNewDraftOrder(quantity, email);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getAllDraftOrdersService = async () => {
    try {
        const response = await getAllDraftOrders();
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateDraftOrderByIdService = async (orderId, newData) => {
    try {
        const response = await updateDraftOrderById(orderId, newData)
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const approveOrderService = async (orderId) => {
    let newData = {
        approved: true
    };
    try {
        const drafOrder = await getDraftOrderByMongoId(orderId);
        const response = await updateDraftOrderById(orderId, newData);
        const newOrder = await createOrderService(drafOrder.quantity, drafOrder.email);

        return newOrder;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


export const getDraftOrderId = async (orderId) => {
    try {
        const order = await getDraftOrder(orderId);
        return order;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getClientDraftOrders = async email => {
    try {
        const response = await getDraftOrdersByClientEmail(email);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};