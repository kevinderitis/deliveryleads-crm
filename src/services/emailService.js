import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import config from '../config/config.js';

const oauth2Client = new google.auth.OAuth2({
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth2callback' 
});

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: 'kevin.deritis77@gmail.com',
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
        accessToken: oauth2Client.getAccessToken()
    }
});

async function sendEmail() {
    try {
        const mailOptions = {
            from: 'kevin.deritis77@gmail.com',
            to: 'kevin.deritis77@gmail.com',
            subject: 'Asunto del correo electrónico',
            text: 'Cuerpo del correo electrónico'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado:', info.messageId);
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
    }
}

sendEmail();
