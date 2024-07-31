import Draft from './models/draftOrderModel.js';
import db from './db.js';

const createNewDraftOrder = async (quantity, email, orderId) => {
  try {
    const newOrder = new Draft({
      quantity,
      email
    });
    await newOrder.save();
    console.log('Pre orden creada exitosamente:', newOrder);
    return newOrder;
  } catch (error) {
    console.error('Error al crear la pre orden:', error.message);
    throw new Error('No se pudo crear la pre orden');
  }
};

const getAllDraftOrders = async () => {
  try {
    const orders = await Draft.find().sort({ createdAt: -1 });
    console.log('Pre ordenes encontradas:', orders);
    return orders;
  } catch (error) {
    console.error('Error al obtener pre ordenes:', error.message);
    throw new Error('No se pudieron obtener las pre órdenes');
  }
};

const getDraftOrderById = async (orderId) => {
  try {
    const order = await Draft.find({ orderId });
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

const getDraftOrderByMongoId = async (orderId) => {
  try {
    const order = await Draft.findById(orderId);
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

const getDraftOrdersByClientEmail = async email => {
  try {
    const orders = await Draft.find({ email });
    return orders;
  } catch (error) {
    console.error('Error al obtener órdenes por email:', error.message);
    throw new Error('No se pudieron encontrar órdenes activas para este cliente');
  }
};


const updateDraftOrderById = async (orderId, newData) => {
  try {
    const updatedOrder = await Draft.findByIdAndUpdate(orderId, newData, {
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

const deleteDraftOrderById = async (orderId) => {
  try {
    const deletedOrder = await Draft.findByIdAndDelete(orderId);
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

export { createNewDraftOrder, getAllDraftOrders, getDraftOrderById, updateDraftOrderById, deleteDraftOrderById, getDraftOrdersByClientEmail, getDraftOrderByMongoId };
