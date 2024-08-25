import axios from 'axios';
import config from "../config/config.js";
import mongoose from 'mongoose';
import fs from 'fs';
import Lead from '../dao/models/leadModel.js';
// import db from '../dao/db.js';

const url = config.MONGO_URL;
const Chat = Lead;

const phoneNumbers = [
    "5492634953604",
    "5493455283102",
    "5491151157536",
    "5493401642091",
    "5491170044711",
    "5493875735491",
    "5493815543924",
    "5493886412298",
    "5491162494856",
    "5493704016519",
    "5493725445050",
    "5493794698180",
    "5493517652321",
    "5491166703691",
    "5493426282469",
    "5493644345126",
    "5493705122810",
    "5492364311196",
    "5493513029819",
    "5493624072262",
    "5491136760172",
    "5493812124351",
    "5491133705550",
    "5493756437552",
    "5493872109432",
    "5492964614849",
    "5493875181882",
    "5493585612292",
    "5491164792813",
    "5491144085554",
    "5492964471733",
    "5491126718617",
    "5493544544959",
    "5493755662490",
    "5492622615454",
    "5491167917009",
    "5492392615823",
    "5493425115075",
    "5491134387861",
    "5493541351664",
    "5493795107005",
    "5493364242748",
    "5493424438674",
    "5493424769944",
    "5493424789993",
    "5492974228804",
    "5493424065561",
    "5493515130067",
    "5492262361240",
    "5493834190350",
    "5492944935492",
    "5493454406661",
    "5493624290260",
    "5492241537038",
    "5492323363222",
    "5492984227670",
    "5491141818176",
    "5491125474430",
    "5492216721767",
    "5492216205448",
    "5491154676878",
    "5493844586177",
    "5493445534639",
    "5492644768671",
    "5492984388267",
    "5493625474132",
    "5493756585952",
    "5493517358933",
    "5493547624592",
    "5493537671113",
    "5493492265591",
    "5492994134445",
    "5493825418717",
    "5491141626662",
    "5492612097284",
    "5493644709804",
    "5493547323818",
    "5491164554163",
    "5493825674229",
    "5491130871274",
    "5491161747453",
    "5493456430853",
    "5491131937094",
    "5492215916367",
    "5493704982054",
    "5493364618311",
    "5491152208128",
    "5492966574850",
    "5491176114210",
    "5491138999564",
    "5491135702201",
    "5493764125979",
    "5491163085336",
    "5492994604706"
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

sendBulkMessages(phoneNumbers);

// sendMessage('5492634390767');