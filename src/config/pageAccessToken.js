import dotenv from 'dotenv';
dotenv.config();

export const pageAccessTokens = {
    '218422194690186': process.env.MESSENGER_ACCESS_TOKEN,
    '482625998261420': process.env.MESSENGER_ACCESS_TOKEN_2,
    '446049128584514': process.env.MESSENGER_ACCESS_TOKEN_3,
    '192687137270358': process.env.MESSENGER_ACCESS_TOKEN_4,
};