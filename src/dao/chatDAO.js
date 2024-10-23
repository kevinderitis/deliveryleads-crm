import Chat from "./models/chatModel.js";
import axios from 'axios';
import config from '../config/config.js';
import db from "./db.js";

export const addMessage = async (from, to, text, image, audioUrl) => {
  try {
    let chat = await Chat.findOne({ username: to, client: from });

    if (!chat) {
      chat = new Chat({ username: to, client: from , messages: [] });
    }

    chat.messages.push({ from: 'client', to: 'user', text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};

export const addUserMessage = async (from, to, text, image, audioUrl, fanpageId) => {
  try {
    let chat = await Chat.findOne({ username: from });

    if (!chat) {
      chat = new Chat({ username: from, client: to , messages: [], fanpageId });
    }

    chat.messages.push({ from: 'user', to: 'client', text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};

export const addWelcomeMessage = async (from, to, text, image, audioUrl) => {
  try {
    let chat = await Chat.findOne({ username: to, client: from });

    if (!chat) {
      chat = new Chat({ username: to, client: from , messages: [] });
    }

    chat.messages.push({ from: 'client', to: 'user', text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};


export const getMessagesForChat = async (fromParam, toParam) => {
  try {
    // const chat = await Chat.findOne({ participants: { $all: participants } });
    const chat = await Chat.find({
        $or: [
          { from: fromParam, to: toParam },
          { from: toParam, to: fromParam }
        ]
      });
    if (!chat) {
      return [];
    }

    return chat.messages;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getMessagesForUser = async user => {
  try {
    const chat = await Chat.findOne({ username: user });

    if (!chat) {
      return [];
    }

    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getChatForUser = async client => {
  try {
    const chat = await Chat.findOne({ client });
    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getUsersList = async email => {
  try {
    const chats = await Chat.find({ client: email }).sort({ updatedAt: -1 });

    return chats;
  } catch (error) {
    throw new Error('Error retrieving user list: ' + error.message);
  }
}

export const getFilteredUsersList = async (email, filter) => {
  try {
    const chats = await Chat.find({
      client: email,
      tags: filter
    }).sort({ updatedAt: -1 });

    return chats;
  } catch (error) {
    throw new Error('Error retrieving user list: ' + error.message);
  }
}

export const sendMessageToClient = async (phone, message) => {
  try {
    const response = await axios.post(config.CLIENT_URL, {
      phone,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export const changeNickname = async (nickName, userId, password) => {
  try {
    const chat = await Chat.findOne({ username: userId });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }
    chat.nickname = nickName;

    if (password) {
      chat.password = password;
    }

    await chat.save();
  } catch (error) {
    console.error('Error al agregar el tag:', error.message);
  }
};

export const savePhoneNumber = async (phone, userId) => {
  try {
    const chat = await Chat.findOne({ username: userId });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }
    chat.phone = phone;

    await chat.save();
  } catch (error) {
    console.error('Error al agregar el phone:', error.message);
  }
};

export const saveUserEmail = async (email, userId) => {
  try {
    const chat = await Chat.findOne({ username: userId });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }
    chat.email = email;

    await chat.save();
  } catch (error) {
    console.error('Error al agregar el email:', error.message);
  }
};

export const setUserProperties = async (email, username) => {
  try {
    const chat = await Chat.findOne({ username });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }
    chat.username = username;
    chat.email = email

    await chat.save();
  } catch (error) {
    console.error('Error al agregar el tag:', error.message);
  }
};

export const addTagToChatByParticipant = async (participant, tagName) => {
  try {
    const chat = await Chat.findOne({ username: participant });
    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }

    const tagExists = chat.tags.some(tag => tag === tagName);
    if (!tagExists) {
      chat.tags.push(tagName);
      await chat.save();
      console.log(`Tag '${tagName}' agregado al chat para el participante '${participant}'.`);
    } else {
      console.log(`El tag '${tagName}' ya existe en el chat para el participante '${participant}'.`);
    }
  } catch (error) {
    console.error('Error al agregar el tag:', error.message);
  }
};

export const removeTagFromChatByParticipant = async (participant, tagName) => {
  try {
    const chat = await Chat.findOne({ username: participant });
    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }

    if (!Array.isArray(chat.tags)) {
      throw new Error('La propiedad tags no es un array');
    }

    const updatedTags = chat.tags.filter(tag => {
      tag && tag.trim() === tagName.trim()
    });

    if (updatedTags.length !== chat.tags.length) {
      chat.tags = chat.tags.filter(tag => tag.trim() !== tagName.trim());
      await chat.save();
      console.log(`Tag '${tagName}' eliminado del chat para el participante '${participant}'.`);
    } else {
      console.log(`El tag '${tagName}' no se encontró en el chat para el participante '${participant}'.`);
    }
  } catch (error) {
    console.error('Error al eliminar el tag:', error.message);
  }
};
