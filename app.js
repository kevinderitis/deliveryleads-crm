import express from 'express';
import http from 'http';
import leadRouter from './src/routes/leadRouter.js';
import orderRouter from './src/routes/orderRouter.js';
import clientRouter from './src/routes/clientRouter.js';
import paymentRouter from './src/routes/paymentRouter.js';
import authRouter from './src/routes/authRouter.js';
import draftOrderRouter from './src/routes/draftOrderRouter.js';
import whatsappRouter from './src/routes/whatsappRouter.js';
import crmRouter from './src/routes/crm.js';
import { setupWebSocketServer } from './src/websocket/ws-handler.js';
import session from 'express-session';
import passport from './src/config/passport.js';
import cors from 'cors';
import config from './src/config/config.js';
import { initializeClient } from './src/routes/whatsappRouter.js';
import ejs from 'ejs';

const app = express();
const server = http.createServer(app);
export const wss = setupWebSocketServer(server);

app.use(cors({
    credentials: true
  }));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: config.SECRET_PASSPORT,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/crm', crmRouter);
app.use('/lead', leadRouter)
app.use('/order', orderRouter)
app.use('/client', clientRouter)
app.use('/payment', paymentRouter)
app.use('/auth', authRouter)
app.use('/draft', draftOrderRouter)
app.use('/whatsapp', whatsappRouter);

initializeClient();

const PORT = config.PORT;
server.listen(PORT, () => console.log(`Server running on port: ${server.address().port}`))