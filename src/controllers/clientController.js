import { getAllClients, updateClientById, createNewClient, getClientByEmail, updateClientPhoneByEmail, updateClientStateByEmail, updateClientPhoneByTelegramId, isAdmin } from "../dao/clientDAO.js";
import { getClientOrders, getLastOrderByClientEmailService } from "../services/orderService.js";
import { getClientDraftOrders } from "../services/draftOrderService.js";
import { calculateTotalLeads, setTelegramChatIdService, updateWelcomeMessageService, getClientByTelegramService, getAdminPhonesService, updateUserNicknameByEmailService, setTelegramChannelIdService, updateUserPasswordService } from "../services/clientService.js";

export const getAll = async (req, res) => {
    try {
        const clients = await getAllClients();

        if (!clients || clients.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes' });
        }

        res.status(200).json(clients);
    } catch (error) {
        console.error('Error al obtener todos los clientes:', error.message);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
};

export const getAdminPhones = async (req, res) => {
    try {
        const phones = await getAdminPhonesService();

        if (!phones) {
            return res.status(404).json({ message: 'No se encontraron telefonos' });
        }

        res.status(200).json(phones);
    } catch (error) {
        console.error('Error al obtener todos los clientes:', error.message);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
};

// export const getAll = async (req, res) => {
//     try {
//         const clients = await getAllClients();

//         if (!clients || clients.length === 0) {
//             return res.status(404).json({ message: 'No se encontraron clientes' });
//         }

//         const expandedClients = clients.reduce((expandedArray, client) => {
//             client.phones.forEach(phone => {
//                 expandedArray.push({ ...client.toObject(), phone });
//             });
//             return expandedArray;
//         }, []);

//         res.status(200).json(expandedClients);
//     } catch (error) {
//         console.error('Error al obtener todos los clientes:', error.message);
//         res.status(500).json({ error: 'Error al obtener los clientes' });
//     }
// };


export const getData = async (req, res) => {
    let email = req.user ? req.user.email : req.session.user.email;
    try {
        const client = await getClientByEmail(email);
        const clientOrders = await getClientOrders(email);
        const clientDraftOrders = await getClientDraftOrders(email);
        const admin = await isAdmin(email);
        const totalLeads = calculateTotalLeads(clientOrders);

        if (!client) {
            return res.status(404).json({ message: 'No se encontraron clientes' });
        }

        const clientDTO = {
            name: client.name ? client.name : client.email,
            email: client.email,
            orders: clientOrders.length,
            draftObj: clientDraftOrders,
            draft: clientDraftOrders.length,
            phone: client.phone,
            ordersObj: clientOrders,
            clientState: client.state,
            admin,
            totalLeads
        };

        res.status(200).json(clientDTO);
    } catch (error) {
        console.error('Error al obtener todos los clientes:', error.message);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
};

export const updateClient = async (req, res) => {
    const clientId = req.params.id;
    const newData = req.body;

    try {
        const updatedClient = await updateClientById(clientId, newData);

        if (!updatedClient) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

export const updatePhone = async (req, res) => {
    let email = req.user ? req.user.email : req.session.user.email;
    let phone = req.body.phone;

    try {
        const updatedClient = await updateClientPhoneByEmail(phone, email);

        if (!updatedClient) {
            return res.status(404).json({ message: 'No se pudo cambiar el telefono' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};


export const updateUserPhone = async (req, res) => {
    let { email, newPhone, telegramChatId } = req.body;

    try {
        let updatedClient;

        if (telegramChatId) {
            updatedClient = await updateClientPhoneByTelegramId(newPhone, telegramChatId);
        } else {
            updatedClient = await updateClientPhoneByEmail(newPhone, email);
        }

        if (!updatedClient) {
            return res.status(404).json({ message: 'No se pudo cambiar el telefono' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

export const updateUserNickname = async (req, res) => {
    let { email, newNickname } = req.body;

    try {
        let updatedClient = await updateUserNicknameByEmailService(newNickname, email);

        if (!updatedClient) {
            return res.status(404).json({ message: 'No se pudo cambiar el nombre del cajero' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};


export const updateClientState = async (req, res) => {
    let email = req.user ? req.user.email : req.session.user.email;
    let state = req.body.state;

    try {
        const updatedClient = await updateClientStateByEmail(state, email);

        if (!updatedClient) {
            return res.status(404).json({ message: 'No se pudo cambiar el telefono' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente por ID:', error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

export const createClient = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        const newClient = await createNewClient(name, email, password, phone);
        res.status(200).json(newClient);
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ error: 'Error interno al crear el cliente' });
    }
};

export const setTelegramChatId = async (req, res) => {
    const { userId, telegramChatId } = req.body;
    try {
        const client = await setTelegramChatIdService(userId, telegramChatId);
        let response = {
            clientId: client._id,
            tgadmin: client.tgadmin
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ error: 'Error interno al crear el cliente' });
    }
};

export const setTelegramChannelId = async (req, res) => {
    const { userId, channelId } = req.body;
    try {
        const client = await setTelegramChannelIdService(userId, channelId);
        let response = {
            clientId: client._id,
            tgchatid: client.tgchatid
        }
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al crear el cliente:', error);
        res.status(500).json({ error: 'Error interno al crear el cliente' });
    }
};

export const updateWelcomeMessage = async (req, res) => {
    const { email } = req.params;
    const { welcomeMessage } = req.body;

    try {
        const updatedClient = await updateWelcomeMessageService(email, welcomeMessage);
        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar mensaje de bienvenida:', error);
        res.status(500).json({ message: 'Error al actualizar mensaje de bienvenida' });
    }
}

export const getClientByTgId = async (req, res) => {
    const { tgchatid } = req.params;
    
    try {
        let client = await getClientByTelegramService(tgchatid);
        let order = await getLastOrderByClientEmailService(client.email);
        let data = {
            phoneNumber: client.phone,
            remainingLeads: order?.quantity ?? 0
        };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error al actualizar mensaje de bienvenida:', error);
        res.status(500).json({ message: 'Error al obtener info de usuario' });
    }
}

export const updateUserPassword = async (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;
    try {
        let response = await updateUserPasswordService(username, newPassword);
        res.status(200).json({ msg: 'Password actualizada'});
    } catch (error) {
        console.error('Error al actualizar mensaje de bienvenida:', error);
        res.status(500).json({ message: 'Error al obtener info de usuario' });
    }
}
