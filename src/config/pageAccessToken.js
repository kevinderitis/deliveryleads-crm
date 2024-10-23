import dotenv from 'dotenv';
dotenv.config();

export const pageAccessTokens = {
    '123456789012345': process.env.MESSENGER_ACCESS_TOKEN,
    '987654321098765': process.env.MESSENGER_ACCESS_TOKEN_2,
};