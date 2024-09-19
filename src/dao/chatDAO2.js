import Chat from "./models/chatModel.js";
import axios from 'axios';
import config from '../config/config.js';
import db from "./db.js";

export const addMessage = async (from, to, text, image, audioUrl) => {
  try {
    let chat = await Chat.findOne({ participants: { $all: [from, to] } });

    if (!chat) {
      chat = new Chat({ participants: [from, to], messages: [] });
    }

    chat.messages.push({ from, to, text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};

export const addWelcomeMessage = async (from, to, text, image, audioUrl) => {
  try {
    let chat = await Chat.findOne({ username: from, client: to });

    if (!chat) {
      chat = new Chat({ username: from, client: to , messages: [] });
    }

    chat.messages.push({ from, to, text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};

// export const addWelcomeMessage = async (from, to, text, image, audioUrl) => {
//   try {
//     let chat = await Chat.findOne({ participants: { $all: [from, to] } });

//     if (!chat) {
//       chat = new Chat({ participants: [to, from], messages: [] });
//     }

//     chat.messages.push({ from, to, text, image, audioUrl });

//     await chat.save();

//     return chat;
//   } catch (error) {
//     throw new Error('Error adding message: ' + error.message);
//   }
// };

export const getMessagesForChat = async participants => {
  try {
    const chat = await Chat.findOne({ participants: { $all: participants } });

    if (!chat) {
      return [];
    }

    return chat.messages;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getMessagesForUser = async participants => {
  try {
    const chat = await Chat.findOne({ participants: { $in: participants } });

    if (!chat) {
      return [];
    }

    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getChatForUser = async participants => {
  try {
    const chat = await Chat.findOne({ participants: { $in: participants } });
    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getUsersList = async email => {
  try {
    const chats = await Chat.find({ participants: email }).sort({ updatedAt: -1 });

    // if (!chats.length) {
    //     return [];
    // }

    // const usersSet = new Set();
    // chats.forEach(chat => {
    //     chat.participants.forEach(participant => {
    //         if (participant !== email) {
    //             usersSet.add(participant);
    //         }
    //     });
    // });

    // return Array.from(usersSet);
    return chats;
  } catch (error) {
    throw new Error('Error retrieving user list: ' + error.message);
  }
}

export const getFilteredUsersList = async (email, filter) => {
  try {
    const chats = await Chat.find({
      participants: email,
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
    const chat = await Chat.findOne({ participants: userId });

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

export const setUserProperties = async (phone, username) => {
  try {
    const chat = await Chat.findOne({ participants: username });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }
    chat.nickname = username;
    chat.phone = phone

    await chat.save();
  } catch (error) {
    console.error('Error al agregar el tag:', error.message);
  }
};

export const addTagToChatByParticipant = async (participant, tagName) => {
  try {
    const chat = await Chat.findOne({ participants: participant });
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
    const chat = await Chat.findOne({ participants: participant });
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
