import Order from './models/orderModel.js';
import db from './db.js';

const createNewOrder = async (quantity, email, orderId) => {
  try {
    const newOrder = new Order({
      orderId,
      quantity,
      email
    });
    await newOrder.save();
    console.log('Orden creada exitosamente:', newOrder);
    return newOrder;
  } catch (error) {
    console.error('Error al crear la orden:', error.message);
    throw new Error('No se pudo crear la orden');
  }
};

const getAllOrders = async () => {
  try {
    // const orders = await Order.find().sort({ createdAt: -1 });;
    const orders = await Order.findWithClientInfo();
    console.log('Órdenes encontradas:', orders);
    return orders;
  } catch (error) {
    console.error('Error al obtener órdenes:', error.message);
    throw new Error('No se pudieron obtener las órdenes');
  }
};

const getOrderById = async (orderId) => {
  try {
    const order = await Order.find({ orderId });
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    console.log('Orden encontrada:', order);
    return order;
  } catch (error) {
    console.error('Error al obtener orden por ID:', error.message);
    throw new Error('No se pudo encontrar la orden');
  }
};

const getOrdersByClientEmail = async email => {
  try {
    const orders = await Order.find({ email });

    return orders;
  } catch (error) {
    console.error('Error al obtener órdenes por email:', error.message);
    throw new Error('No se pudieron encontrar órdenes activas para este cliente');
  }
};

const getLastOrderByClientEmail = async (email, delivered) => {
  try {
    const order = await Order.findOne({ email, delivered }).sort({ createdAt: -1 });

    return order;
  } catch (error) {
    console.error('Error al obtener órdenes por email:', error.message);
    throw new Error('No se pudieron encontrar órdenes activas para este cliente');
  }
};

const getActiveOrdersCountByClientEmail = async email => {
  try {
    const activeOrdersCount = await Order.countDocuments({ email, delivered: false });
    return activeOrdersCount;
  } catch (error) {
    console.error('Error al obtener la cantidad de órdenes activas por email:', error.message);
    throw new Error('No se pudo obtener la cantidad de órdenes activas para este cliente');
  }
};


// const getOldestActiveOrder = async (orderId) => {
//   try {
//     const order = await Order.findOne({ delivered: false }).sort({ updatedAt: 1 }).limit(1);
//     if (!order) {
//       throw new Error('Orden no encontrada');
//     }
//     console.log('Orden encontrada:', order);
//     return order;
//   } catch (error) {
//     console.error('Error al obtener orden por ID:', error.message);
//     throw new Error('No se pudo encontrar la orden');
//   }
// };

const getOldestActiveOrder = async () => {
  try {
    const orders = await Order.aggregate([
      { $match: { delivered: false } },
      {
        $lookup: {
          from: 'clients',
          localField: 'email',
          foreignField: 'email',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      { $match: { 'client.state': true } },
      { $sort: { updatedAt: 1 } },
      { $limit: 1 }
    ]);

    if (orders.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const oldestActiveOrder = orders[0];
    return oldestActiveOrder;
  } catch (error) {
    console.error('Error al obtener la orden más antigua activa:', error.message);
    throw new Error('No se pudo encontrar la orden más antigua activa');
  }
};

const updateOrderById = async (orderId, newData) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, newData, {
      new: true,
    });
    if (!updatedOrder) {
      throw new Error('Orden no encontrada');
    }
    console.log('Orden actualizada:', updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error('Error al actualizar orden por ID:', error.message);
    throw new Error('No se pudo actualizar la orden');
  }
};

const updateOrderByOrderId = async (orderId, newData) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate({ orderId }, newData, { new: true });
    if (!updatedOrder) {
      throw new Error('Orden no encontrada');
    }
    console.log('Orden actualizada:', updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error('Error al actualizar orden por ID:', error.message);
    throw new Error('No se pudo actualizar la orden');
  }
};

const deleteOrderById = async (orderId) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ orderId });
    if (!deletedOrder) {
      throw new Error('Orden no encontrada');
    }
    console.log('Orden eliminada:', deletedOrder);
    return deletedOrder;
  } catch (error) {
    console.error('Error al eliminar orden por ID:', error.message);
    throw new Error('No se pudo eliminar la orden');
  }
};

export { createNewOrder, getAllOrders, getOrderById, updateOrderById, deleteOrderById, getOldestActiveOrder, updateOrderByOrderId, getOrdersByClientEmail, getActiveOrdersCountByClientEmail, getLastOrderByClientEmail };
