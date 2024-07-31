import bcrypt from 'bcrypt';
import { getClientByEmail, createNewClient, isAdmin } from '../dao/clientDAO.js';

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
                res.send({ result: 'Logout ok'});
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
