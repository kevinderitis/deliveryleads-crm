import requestIp from 'request-ip';
import geoip from 'geoip-lite';
import { getUserByEmail } from "../dao/userDAO.js";
import { logAccess } from '../dao/accessLogDAO.js';

export const isAuthenticated = (req, res, next) => {
    if (req.session.user || req.isAuthenticated()) {
        next();
    } else {
        // res.status(401).send({ error: 'Not authenticated'});
        res.redirect('/login.html');
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

const botUserAgents = [
    "facebook", "facebot", "facebookexternalhit", "twitterbot",
    "kakaotalk-scrap", "worksogcrawler", "goscraper",
    "remindpreview", "wildlink_preview_bot", "pagebot",
    "crawler", "spider", "preview", "facebookcatalog"
];


const allowedCountries = ["AR", "MX"];

const blockedCountries = ["IE", "GB", "US"];


export const filterBots = async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = requestIp.getClientIp(req);
    const geo = geoip.lookup(clientIp);

    try {
        await logAccess({
            userAgent,
            ip: clientIp,
            country: geo ? geo.country : 'Unknown'
        });
    } catch (error) {
        console.error("Error al registrar el acceso: ", error);
    }

    if (botUserAgents.some(bot => userAgent.toLowerCase().includes(bot))) {
        return res.redirect('/landing.html');
    }

    if (geo) {
        const country = geo.country;

        if (blockedCountries.includes(country)) {
            return res.redirect('/landing.html');
        }

        if (!allowedCountries.includes(country)) {
            return res.redirect('/landing.html');
        }
    }

    next();
};