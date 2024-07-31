import { getOldestActiveOrderService, updateOrderByOrderIdService } from "./orderService.js";
import { getClientByEmailService } from "./clientService.js";

export const deliverLeadToClient = async () => {
    try {
        const order = await getOldestActiveOrderService();
        const client = await getClientByEmailService(order.email);
        if (order.quantity > 0) {
            let updatedOrder;
            if (order.quantity === 1) {
                updatedOrder = await updateOrderByOrderIdService(order.orderId, { quantity: order.quantity - 1, delivered: true });
            } else {
                updatedOrder = await updateOrderByOrderIdService(order.orderId, { quantity: order.quantity - 1 });
            };
        } else {
            console.log('La cantidad de la orden es 0 o menor, no se puede entregar el lead.');
        }
        return client;
    } catch (error) {
        console.error('Error al enviar leads:', error.message);
        throw new Error('No se pudieron enviar los leads');
    }
};
