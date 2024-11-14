import Payment from './models/paymentModel.js';
import db from './db.js';

const createNewPayment = async (userId, clientId, amount) => {
    try {
        const newPayment = new Payment({
            userId,
            clientId,
            amount
        });
        await newPayment.save();
        console.log('Pago creado exitosamente:', newPayment);
        return newPayment;
    } catch (error) {
        console.error('Error al crear el pago:', error.message);
        throw new Error('No se pudo crear el pago');
    }
};

const getAllPayments = async () => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        console.log('Pagos encontrados:', payments);
        return payments;
    } catch (error) {
        console.error('Error al obtener pagos:', error.message);
        throw new Error('No se pudieron obtener los pagos');
    }
};

const getPaymentById = async (paymentId) => {
    try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            throw new Error('Pago no encontrado');
        }
        console.log('Pago encontrado:', payment);
        return payment;
    } catch (error) {
        console.error('Error al obtener pago por ID:', error.message);
        throw new Error('No se pudo encontrar el pago');
    }
};

const getPaymentsByClientId = async (clientId) => {
    try {
        const payments = await Payment.find({ clientId });
        console.log('Pagos encontrados para clientId:', clientId, payments);
        return payments;
    } catch (error) {
        console.error('Error al obtener pagos por clientId:', error.message);
        throw new Error('No se pudieron encontrar pagos para este cliente');
    }
};

const updatePaymentsByClientId = async (clientId, newData) => {
    try {
        const updatedPayments = await Payment.updateMany({ clientId }, newData);
        if (updatedPayments.modifiedCount === 0) {
            throw new Error('No se encontraron pagos para este cliente');
        }
        console.log('Pagos actualizados para clientId:', clientId, updatedPayments);
        return updatedPayments;
    } catch (error) {
        console.error('Error al actualizar pagos por clientId:', error.message);
        throw new Error('No se pudieron actualizar los pagos para este cliente');
    }
};

const deletePaymentsByClientId = async (clientId) => {
    try {
        const deletedPayments = await Payment.deleteMany({ clientId });
        if (deletedPayments.deletedCount === 0) {
            throw new Error('No se encontraron pagos para este cliente');
        }
        console.log('Pagos eliminados para clientId:', clientId);
        return deletedPayments;
    } catch (error) {
        console.error('Error al eliminar pagos por clientId:', error.message);
        throw new Error('No se pudieron eliminar los pagos para este cliente');
    }
};

const getPaymentReportData = async (clientId, startDate, endDate) => {
    try {
      const start = new Date(`${startDate}T00:00:00.000Z`);
      const end = new Date(`${endDate}T23:59:59.999Z`);
  
      const reportData = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lte: end
            },
            clientId: clientId, 
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalAmount: { $sum: '$amount' }, 
            paymentCount: { $sum: 1 } 
          }
        },
        {
          $sort: { _id: 1 } 
        }
      ]);
  
      return reportData.map(entry => ({
        date: entry._id,
        totalAmount: entry.totalAmount,
        paymentCount: entry.paymentCount
      }));
    } catch (error) {
      console.error('Error al obtener los datos del reporte de pagos:', error.message);
      throw new Error('Error al obtener los datos del reporte de pagos');
    }
  };

export {
    createNewPayment,
    getAllPayments,
    getPaymentById,
    getPaymentsByClientId,
    updatePaymentsByClientId,
    deletePaymentsByClientId,
    getPaymentReportData
};