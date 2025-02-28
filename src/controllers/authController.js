import bcrypt from 'bcrypt';
import { getClientByEmail, createNewClient, isAdmin } from '../dao/clientDAO.js';
import { addWelcomeMessage, changeNickname, getChatForUser, setUserProperties, getChatByNickName } from '../dao/chatDAO.js';
import { deliverLeadToClient } from '../services/leadService.js';

const formatNumber = number => {
    let cleaned = number.replace(/^\+/, '').replace(/\D/g, '');

    if (cleaned.startsWith('549') && cleaned.length === 13) {
        return `549${cleaned.substring(3, 5)}${cleaned.substring(5)}`;
    } else if (cleaned.length === 10 || cleaned.length === 11) {
        if (cleaned.length === 10) {
            return `549${cleaned.substring(0, 2)}${cleaned.substring(2)}`;
        } else {
            return `549${cleaned.substring(1, 4)}${cleaned.substring(4)}`;
        }
    } else {
        return `Numero invalido:  ${cleaned}`;
    }
}

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await getClientByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).send('El correo electrónico ya está registrado');
        }
        let pass = password ? password : 'default';

        const hashedPassword = await bcrypt.hash(pass, 10);

        const newUser = await createNewClient(name, email, hashedPassword);

        res.status(201).send({ result: `Usuario creado: ${newUser.email}` });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

export const leadSignUp = async (req, res) => {
    // Funcion a cambiar para unificar numero
    const { username, email } = req.body;
    try {
        const existingLead = await getChatForUser(username);

        if (existingLead) {
            return res.status(400).send({ result: 'error', msg: `El nombre de usuario ya está registrado` });
        }

        let client = await deliverLeadToClient();
        let to = client.email;
        await addWelcomeMessage(to, username, `Hola ${username}, mi nombre es Lorena y estoy acá para ayudarte. El casino es https://casinohades.net Recordá que solo por HOY con tu carga de 5000 tenes 2000 de regalo!! 🎁 ¿Cuanto te gustaria cargar?`)

        // if (phone) {
        //     // await changeNickname(phone, username);
        //     await setUserProperties(email, username);
        // }
        await setUserProperties(email, username);

        req.session.lead = username;

        res.status(201).send({ result: `Usuario creado: ${username}`, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
};

export const leadLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingLead =    await getChatByNickName(username);

        if (!existingLead) {
            return res.status(400).send({ result: 'error', msg: `El usuario no existe.` });
        }

        if (existingLead.password === password) {
            req.session.lead = username;

            res.status(201).send({ result: `Usuario logueado: ${username}`, success: true, chat: existingLead });
        }else{
            res.status(401).send({ result: `Contraseña erronea: ${username}`, success: false, msg: 'La contraseña es incorrecta.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

export const login = async (req, res) => {
    try {
        const user = await getClientByEmail(req.body.email);

        if (!user) {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            req.session.user = user;
            let admin = await isAdmin(user.email);
            res.send({ result: `Acceso permitido: ${user.email}`, admin });
        } else {
            return res.status(401).send('Nombre de usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
};

export const logout = async (req, res) => {
    try {
        const logoutPromise = () => {
            return new Promise((resolve, reject) => {
                req.logout((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        };

        await logoutPromise();

        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir la sesión:', err);
                res.status(500).send('Error al cerrar la sesión');
            } else {
                res.send({ result: 'Logout ok' });
            }
        });
    } catch (error) {
        console.error('Error al cerrar la sesión:', error);
        res.status(500).send('Error al cerrar la sesión');
    }
};

export const userEmail = async (req, res) => {
    try {
        if (req.user && req.user.email) {
            return res.send({ email: req.user.email });
        } else if (req.session.user && req.session.user.email) {
            return res.send({ email: req.session.user.email });
        } else {
            throw new Error('No hay usuario autenticado en la sesión');
        }
    } catch (error) {
        console.error('Error en userEmail:', error);
        return res.status(500).send({ error: 'Error interno del servidor' });
    }
};

export const leadEmail = async (req, res) => {
    let email = req.user ? req.user.email : req.session.lead;
    if (email) {
        let chat
        try {
            chat = await getChatForUser(email);
        } catch (error) {
            console.log('Error getting chats');
        }

        res.send({ email, chat })
    } else {
        res.send({ error: 'Not email' })
    }

};