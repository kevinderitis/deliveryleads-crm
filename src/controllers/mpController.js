import { getPaymentByReference } from '../services/mpService.js';
import { updateLeadPaymentByEmail } from '../dao/leadDAO.js';
import { sendLeadsToClient } from '../services/leadService.js';

export const webhook = async (req, res) => {
    let data = req.query;
    let paymentId = data['data.id'];

    if (!paymentId) {
        console.log('No se proporcionó paymentId en la solicitud.');
        return res.status(400).send('Falta el parámetro paymentId en la solicitud.');
    }

    try {
        let payment = await getPaymentByReference(paymentId);
        if (payment && payment.status === 'approved') {
            let email = payment.external_reference;
            let quantity = payment.quantity;
            if (email) {
                await updateLeadPaymentByEmail(email, true);
                await sendLeadsToClient(email, quantity);
            }
        }
        console.log(payment);
    } catch (error) {
        console.log(error);
        throw error;
    }

    res.send('ok');
};