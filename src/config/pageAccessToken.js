import dotenv from 'dotenv';
dotenv.config();

export const pageAccessTokens = {
    '218422194690186': process.env.MESSENGER_ACCESS_TOKEN,
    '987654321098765': process.env.MESSENGER_ACCESS_TOKEN_2,
};