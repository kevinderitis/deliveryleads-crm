// import { MercadoPagoConfig, Preference } from 'mercadopago';
// import axios from 'axios';
// import config from '../config/config.js';

// const client = new MercadoPagoConfig({ accessToken: config.MERCADOPAGO_ACCESS_TOKEN });

// export const createPaymentPreference = async (email, quantity) => {
//     try {
//         const productPrice = Number(process.env.MP_PRODUCT_PRICE);
//         const preference = new Preference(client);
//         const createdPref = await preference.create({
//             body: {
//                 items: [{
//                     title: config.MP_PRODUCT_TITLE,
//                     unit_price: productPrice,
//                     quantity
//                 }],
//                 external_reference: email,
//                 notification_url: `${config.APP_DOMAIN}/mp/webhook`,
//                 back_urls: {
//                     success: config.BACK_SUCCESS_URL_MP
//                 }
//             }
//         });

//         return createdPref.sandbox_init_point;
//     } catch (error) {
//         console.error('Error al crear la preferencia de pago:', error);
//         throw new Error('Error al procesar la solicitud');
//     }
// };

// export const getPaymentByReference = async paymentId => {
//     const url = `https://api.mercadopago.com/v1/payments/${paymentId}?access_token=${config.MERCADOPAGO_ACCESS_TOKEN}`;
//     try {
//         let response = await axios.get(url);
//         return response.data;
//     } catch (error) {
//         console.log(error);
//         return null
//     }
// }