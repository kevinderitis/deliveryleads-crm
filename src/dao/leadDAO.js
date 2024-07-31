import Lead from './models/leadModel.js';
import db from './db.js';

const createNewLead = async (name, email, phone) => {
  try {
    let existingLead = await Lead.findOne({ email });

    if (!existingLead) {
      const newLead = new Lead({
        name,
        email,
        phone
      });
      await newLead.save();
      console.log('Lead creado exitosamente:', newLead);
      return newLead;
    }
  } catch (error) {
    console.error('Error al crear o actualizar lead:', error.message);
    throw new Error('No se pudo crear o actualizar el lead');
  }
};


const getAllLeads = async () => {
  try {
    const leads = await Lead.find();
    console.log('Leads encontrados:', leads);
    return leads;
  } catch (error) {
    console.error('Error al obtener leads:', error.message);
    throw new Error('No se pudieron obtener los leads');
  }
};

const getNotSentLeads = async (quantity) => {
  try {
    const leads = await Lead.find({ isSent: false }).sort({ createdAt: 1 }).limit(quantity);
    console.log('Leads encontrados:', leads);
    return leads;
  } catch (error) {
    console.error('Error al obtener leads:', error.message);
    throw new Error('No se pudieron obtener los leads');
  }
};


const getLeadById = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error('Lead no encontrado');
    }
    console.log('Lead encontrado:', lead);
    return lead;
  } catch (error) {
    console.error('Error al obtener lead por ID:', error.message);
    throw new Error('No se pudo encontrar el lead');
  }
};

const getLeadByChatId = async (chatId) => {
  try {
    const lead = await Lead.findOne({ chatId });
    if (!lead) {
      console.log('Lead no encontrado');
    }
    console.log('Lead encontrado por número de teléfono:', lead);
    return lead;
  } catch (error) {
    console.error('Error al obtener lead por número de teléfono:', error.message);
    throw new Error('No se pudo encontrar el lead por número de teléfono');
  }
};

const updateLeadById = async (leadId, newData) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(leadId, newData, {
      new: true,
    });
    if (!updatedLead) {
      throw new Error('Lead no encontrado');
    }
    console.log('Lead actualizado:', updatedLead);
    return updatedLead;
  } catch (error) {
    console.error('Error al actualizar lead por ID:', error.message);
    throw new Error('No se pudo actualizar el lead');
  }
};

const updateLeadPaymentByEmail = async (email, isSent) => {
  try {
    const lead = await Lead.findOne({ email });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    lead.isSent = isSent;

    await lead.save();

    console.log('Lead actualizado:', lead);
    return lead;
  } catch (error) {
    console.error('Error al actualizar lead por chatId:', error.message);
    throw new Error('No se pudo actualizar el lead');
  }
};

const updateLeadByMainThreadId = async (chatId, threadId) => {
  try {
    const lead = await Lead.findOne({ chatId });

    if (!lead) {
      throw new Error('Lead no encontrado');
    }

    const currentDate = new Date();

    lead.threadId = threadId;
    lead.paymentDate = currentDate;

    await lead.save();

    console.log('Lead actualizado:', lead);
    return lead;
  } catch (error) {
    console.error('Error al actualizar lead por chatId:', error.message);
    throw new Error('No se pudo actualizar el lead');
  }
};

const deleteLeadById = async (leadId) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(leadId);
    if (!deletedLead) {
      throw new Error('Lead no encontrado');
    }
    console.log('Lead eliminado:', deletedLead);
    return deletedLead;
  } catch (error) {
    console.error('Error al eliminar lead por ID:', error.message);
    throw new Error('No se pudo eliminar el lead');
  }
};

const updateManyPayments = async hour => {
  try {
    const result = await Lead.updateMany(
      { payment: true, paymentDate: { $lt: hour } },
      { $set: { payment: false } }
    );
    return result;
  } catch (error) {
    console.error('Error al actualizar payments:', error.message);
    throw new Error('No se pudieron actualizar lead payments');
  }
};

const updateIsSentByPhone = async phoneNumber => {
  try {
    const updatedLead = await Lead.findOneAndUpdate({ phone: phoneNumber }, { isSent: true }, {
      new: true,
    });
    if (!updatedLead) {
      throw new Error('Lead no encontrado');
    }
    console.log('Lead actualizado:', updatedLead);
    return updatedLead;
  } catch (error) {
    console.error('Error al actualizar el valor de isSent por número de teléfono:', error.message);
    throw new Error('No se pudo actualizar el valor de isSent');
  }
};



export { createNewLead, getAllLeads, getLeadById, updateLeadById, deleteLeadById, getLeadByChatId, updateLeadPaymentByEmail, updateLeadByMainThreadId, updateManyPayments, getNotSentLeads, updateIsSentByPhone };