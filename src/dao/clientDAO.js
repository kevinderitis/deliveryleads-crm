import Client from './models/clientModel.js';
import { getUserByEmail } from './userDAO.js';
import bcrypt from 'bcrypt';

import db from './db.js';

const createNewClient = async (name, email, password, phone) => {
    try {
        const newClient = new Client({
            name,
            email,
            password,
            phone
        });
        await newClient.save();
        return newClient;
    } catch (error) {
        console.error('Error al crear el cliente:', error.message);
        throw new Error('No se pudo crear el cliente');
    }
};

const getAllClients = async () => {
    try {
        const clients = await Client.find().sort({ _id: -1 });
        return clients;
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);
        throw new Error('No se pudieron obtener los clientes');
    }
};

const getClientById = async (clientId) => {
    try {
        const client = await Client.findById(clientId);
        if (!client) {
            throw new Error('Cliente no encontrado');
        }
        return client;
    } catch (error) {
        console.error('Error al obtener cliente por ID:', error.message);
        throw new Error('No se pudo encontrar el cliente');
    }
};

const updateClientById = async (clientId, newData) => {
    try {
        const updatedClient = await Client.findByIdAndUpdate(clientId, newData, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateClientPhoneByEmail = async (phone, email) => {
    try {
        const updatedClient = await Client.findOneAndUpdate({ email }, { phone }, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateUserNicknameByEmail = async (email, nickname) => {
    try {
        const updatedClient = await Client.findOneAndUpdate({ email }, { nickname }, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateUserPassword = async (email, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedClient = await Client.findOneAndUpdate({ email }, { password: hashedPassword }, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por username:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateClientPhoneByTelegramId = async (phone, tgchatid) => {
    try {
        const updatedClient = await Client.findOneAndUpdate({ tgchatid }, { phone }, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateWelcomeMessage = async (email, welcomeMessage) => {
    try {
        const updatedClient = await Client.findOneAndUpdate(
            { email: email },
            { textmessage: welcomeMessage },
            { new: true }
        );
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const updateClientStateByEmail = async (state, email) => {
    try {
        const updatedClient = await Client.findOneAndUpdate({ email }, { state }, {
            new: true,
        });
        if (!updatedClient) {
            throw new Error('Cliente no encontrado');
        }
        return updatedClient;
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        throw new Error('No se pudo actualizar el cliente');
    }
};

const deleteClientById = async (clientId) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(clientId);
        if (!deletedClient) {
            throw new Error('Cliente no encontrado');
        }
        return deletedClient;
    } catch (error) {
        console.error('Error al eliminar cliente por ID:', error.message);
        throw new Error('No se pudo eliminar el cliente');
    }
};

const getClientByEmail = async (email) => {
    try {
        const client = await Client.findOne({ email: email });
        if (!client) {
            console.log('Cliente no encontrado!')
        }
        return client;
    } catch (error) {
        console.error('Error al obtener cliente por correo electrónico:', error.message);
        throw new Error('No se pudo encontrar el cliente');
    }
};

const getClientByTelegram = async tgchatid => {
    try {
        const client = await Client.findOne({ tgchatid });
        if (!client) {
            console.log('Cliente no encontrado')
        }
        return client;
    } catch (error) {
        console.error('Error al obtener cliente por correo electrónico:', error.message);
        throw new Error('No se pudo encontrar el cliente');
    }
};

const isAdmin = async (email) => {
    try {
        const client = await getUserByEmail(email);
        return client ? true : false;
    } catch (error) {
        console.error('Error al obtener cliente por correo electrónico:', error.message);
        throw new Error('No se pudo encontrar el cliente');
    }
};

export { createNewClient, getAllClients, getClientById, updateClientById, deleteClientById, getClientByEmail, updateClientPhoneByEmail, updateClientStateByEmail, isAdmin, updateWelcomeMessage, updateClientPhoneByTelegramId, getClientByTelegram, updateUserNicknameByEmail, updateUserPassword };
