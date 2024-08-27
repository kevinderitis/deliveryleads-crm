import axios from 'axios';
import config from "../config/config.js";
import mongoose from 'mongoose';
import fs from 'fs';
import Lead from '../dao/models/leadModel.js';
// import db from '../dao/db.js';

const url = config.MONGO_URL;
const Chat = Lead;

const phoneNumbers = [
    "5493625474132",
    "5491166413312",
    "5493564639844",
    "5492216829671",
    "5491151531797",
    "5492215078064",
    "5493756563450",
    "5493364187654",
    "5492983560647",
    "5493406504946",
    "5493777628503",
    "5492314545056",
    "5493876675145",
    "5492622231671",
    "5493782453603",
    "5491151808338",
    "5493454453681",
    "5493491588893",
    "5493875702194",
    "5493856116844",
    "5492975414305",
    "5493814460171",
    "5491138337083",
    "5493571553762",
    "5493435204964",
    "5491136603378",
    "5493625174624",
    "5491166488488",
    "5491167661139",
    "5493815707869",
    "5492326530874",
    "5493413239678",
    "5493758507600",
    "5493794945054",
    "5493512464667",
    "5493454938410",
    "5493815245618",
    "5491156939904",
    "5493765219897",
    "5493874026733",
    "5493458456728",
    "5492945646849",
    "5493794556466",
    "5493425535106",
    "5493743568064",
    "5492634877243",
    "5493549570373",
    "5493855349431",
    "5491139519101",
    "5492644629081",
    "5492615958761",
    "5493644450676",
    "5492317576907",
    "5493853133139",
    "5493765216082",
    "5492966385476",
    "5491139097751",
    "5493516148499",
    "5491125215946",
    "5493364521823",
    "5491162215489",
    "5493816684899",
    "5491122602643",
    "5493735486317",
    "5493425846966",
    "5493705230055",
    "5491164029998",
    "5492281567926",
    "5493772467940",
    "5492995659872",
    "5493812172241",
    "5493875853522",
    "5491144717728",
    "5493442625569",
    "5493513774775",
    "5493825566325",
    "5493571350643",
    "5491131523351",
    "5493734419903",
    "5491153493167",
    "5492227483906",
    "5492234498771",
    "5491168021934",
    "5493515325602",
    "5492622671405",
    "5491161381603",
    "5493855881866",
    "5493455016390",
    "5493765229403",
    "5492995903091",
    "5493765204573",
    "5493625644399",
    "5493584338294",
    "5492974766060",
    "5491149453781",
    "5493855828677",
    "5493705108422",
    "5493755820782",
    "5492622465981",
    "5491178865529",
    "5493516506302"
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
            await sendWelcomeMessage(number);

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

sendMessage('5491164428012');