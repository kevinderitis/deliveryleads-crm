import { createOrderService, getAllOrdersService, updateOrderByIdService, deleteOrderService, updateOrderByOrderIdService, getOrderIdByTelegramService } from "../services/orderService.js";

export const getAll = async (req, res) => {
    try {
        const orders = await getAllOrdersService();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener todas las órdenes:', error.message);
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};

export const updateOrder = async (req, res) => {
    const orderId = req.params.id;
    const newData = req.body;

    try {
        const updatedOrder = await updateOrderByIdService(orderId, newData);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const stopOrder = async (req, res) => {
    const orderId = req.params.id;
    const newData = { delivered: true };

    try {
        const updatedOrder = await updateOrderByOrderIdService(orderId, newData);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const stopOrderByTelegram = async (req, res) => {
    const tgChatId = req.body.tgchatid;
    const newData = { delivered: true };

    try {
        const orderId = await getOrderIdByTelegramService(tgChatId, !newData.delivered);
        const updatedOrder = await updateOrderByOrderIdService(orderId, newData);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const activateOrderByTelegram = async (req, res) => {
    const tgChatId = req.body.tgchatid;
    const newData = { delivered: false };

    try {
        const orderId = await getOrderIdByTelegramService(tgChatId, !newData.delivered);
        let updatedOrder;

        if (!orderId) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        } else {
            updatedOrder = await updateOrderByOrderIdService(orderId, newData);
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const activateOrder = async (req, res) => {
    const orderId = req.params.id;
    const newData = { delivered: false };

    try {
        const updatedOrder = await updateOrderByOrderIdService(orderId, newData);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const createOrder = async (req, res) => {
    const { quantity, email } = req.body;

    try {
        const preference = await createOrderService(quantity, email);
        res.status(200).json({ preference });
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).json({ error: 'Error interno al crear la orden' });
    }
};

export const deleteOrder = async (req, res) => {
    const orderId = req.params.id;

    try {
        let result = await deleteOrderService(orderId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al eliminar la orden:', error);
        res.status(500).json({ error: 'Error interno al eliminar la orden' });
    }
};
