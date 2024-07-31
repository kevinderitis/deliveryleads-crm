import { getOrderId } from "../services/orderService.js";

export const newPayment = async (req, res) => {
    const orderId = req.body.orderId;

    try {
        const order = await getOrderId(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error al actualizar la orden por ID:', error.message);
        res.status(500).json({ error: 'Error al actualizar la orden' });
    }
};