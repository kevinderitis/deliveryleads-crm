import { createDraftOrderService, getAllDraftOrdersService, updateDraftOrderByIdService, approveOrderService } from "../services/draftOrderService.js";

export const getAllDraftOrders = async (req, res) => {
    try {
        const orders = await getAllDraftOrdersService();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener todas las órdenes:', error.message);
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};

export const updateDraftOrder = async (req, res) => {
    const orderId = req.params.id;
    const newData = req.body;

    try {
        const updatedOrder = await updateDraftOrderByIdService(orderId, newData);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const approveOrder = async (req, res) => {
    const orderId = req.params.id;

    try {
        const updatedOrder = await approveOrderService(orderId);

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const createDraftOrder = async (req, res) => {
    const { quantity } = req.body;
    let userEmail = req.user ? req.user.email : req.session.user.email;

    try {
        const response = await createDraftOrderService( quantity, userEmail);
        res.status(200).json({ response });
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).json({ error: 'Error interno al crear la orden' });
    }
};
