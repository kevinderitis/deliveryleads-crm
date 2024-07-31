import { getUserByEmail } from "../dao/userDAO.js";

export const isAuthenticated = (req, res, next) => {
    if (req.session.user || req.isAuthenticated()) {
        next();
    } else {
        res.status(401).send({ error: 'Not authenticated'});
    }
};

export const isAdmin = async (req, res, next) => {
    let email = req.user ? req.user.email : req.session.user.email;
    try {
        let user = await getUserByEmail(email);
        if (user.rol === 'admin') {
            next()
        } else {
            res.status(401).send({ error: 'Not admin' });
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({ error });
    }

};