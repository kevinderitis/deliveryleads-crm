import bcrypt from 'bcrypt';
import { getClientByEmail, createNewClient, isAdmin } from '../dao/clientDAO.js';
import { addWelcomeMessage, changeNickname, getChatForUser } from '../dao/chatDAO.js';
import { deliverLeadToClient } from '../services/leadService.js';

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
    const { username, phone } = req.body;
    try {
        const existingLead = await getChatForUser(username);

        if (existingLead) {
            return res.status(400).send({ result: 'error', msg: `El nombre de usuario ya está registrado` });
        }

        let client = await deliverLeadToClient();
        let to = client.email;
        await addWelcomeMessage(to, username, `Bienvenido ${username}! Soy Carla, tu cajera de confianza. En que puedo ayudarte?`)

        if (phone) {
            await changeNickname(phone, username);
        }

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
        const existingLead = await getChatForUser(username);

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
    let email = req.user ? req.user.email : req.session.user.email;
    res.send({ email })
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