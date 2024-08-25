import axios from 'axios';
import config from "../config/config.js";
import mongoose from 'mongoose';
import fs from 'fs';
import Lead from '../dao/models/leadModel.js';
// import db from '../dao/db.js';

const url = config.MONGO_URL;
const Chat = Lead;

const phoneNumbers = [
    "5493704985970",
    "5492984219593",
    "5492645489702",
    "5493329322472",
    "5493407473478",
    "5492984526887",
    "5492345655690",
    "5491123362501",
    "5492945641886",
    "5493875521154",
    "5493886516007",
    "5492233060810",
    "5491141419835",
    "5493816255865",
    "5493472591167",
    "5493425486129",
    "5493644797568",
    "5491135250684",
    "5493524417941",
    "5493751335704",
    "5493513912037",
    "5493751667655",
    "5492644593675",
    "5491141846394",
    "5493874679503",
    "5491124802657",
    "5493875792533",
    "5493888451802",
    "5493705104953",
    "5493812362165",
    "5493757338218",
    "5493513657051",
    "5493512010617",
    "5492645452827",
    "5492644658905",
    "5493564609149",
    "5493491608149",
    "5492646305903",
    "5491125768844",
    "5491123602090",
    "5492944923696",
    "5492964352565",
    "5493446649955",
    "5492634687262",
    "5492995569033",
    "5493816599101",
    "5491123855115",
    "5491123878996",
    "5493795386000",
    "5492246506022",
    "5492255555927",
    "5491131296450",
    "5493816594918",
    "5491128193527",
    "5493875358106",
    "5493624068846",
    "5493814637878",
    "5492643172203",
    "5493804200312",
    "5493425059895",
    "5493804895815",
    "5493765497346",
    "5491132906916",
    "5492494246078",
    "5491136706249",
    "5493764394754",
    "5492646256487",
    "5493764862834",
    "5493447457675"
];

async function fetchChatIds() {
    try {
        const result = await Chat.find({ status: 'pending' }).sort({ createdAt: -1 }).select('chatId -_id');;
        const chatIds = result.map(doc => doc.chatId);
        console.log('Chat IDs:', chatIds);

        fs.writeFileSync('chatIds.txt', chatIds.join('\n'), 'utf8');
        console.log('Chat IDs saved to chatIds.txt');

    } catch (err) {
        console.error('Error fetching chat IDs:', err);
    } finally {
        await mongoose.disconnect();
    }
}

// fetchChatIds();

export const sendWelcomeMessage = async (to) => {
    try {
        const response = await axios.post(`${config.WHATSAPP_API_URL}/${config.PHONE_ID}/messages`, {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: 'promo_leads',
                language: { code: 'es_AR' },
                components: [
                    {
                        type: 'header',
                        parameters: [
                            {
                                type: 'image',
                                image: { link: 'https://img.freepik.com/fotos-premium/perro-mirando-caer-billetes-dinero_639249-265.jpg' }
                            }
                        ]
                    }
                ]
            }
        }, {
            headers: {
                'Authorization': `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Message sent to: ${to}`);
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const sendBulkMessages = async (phoneNumbersList) => {
    console.log(phoneNumbersList);
    try {
        for (const number of phoneNumbersList) {
            const response = await sendWelcomeMessage(number);
            console.log(`Mensaje enviado a ${number}:`, response);

            await delay(8000);
        }
    } catch (error) {
        console.log('Error al enviar el mensaje:', error);
    }
};

const sendMessage = async (number) => {
    try {
        await sendWelcomeMessage(number);
    } catch (error) {
        console.log('Error al enviar el mensaje:', error);
    }
}

// sendBulkMessages(phoneNumbers);

// sendMessage('5492634390767');