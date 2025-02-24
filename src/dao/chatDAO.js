import Chat from "./models/chatModel.js";
import axios from 'axios';
import config from '../config/config.js';
import db from "./db.js";

export const addMessage = async (from, to, text, image, audioUrl) => {
  try {
    let chat = await Chat.findOne({ username: to, client: from });

    if (!chat) {
      chat = new Chat({ username: to, client: from, messages: [] });
    }

    chat.messages.push({ from: 'client', to: 'user', text, image, audioUrl });

    await chat.save();

    return chat;
  } catch (error) {
    throw new Error('Error adding message: ' + error.message);
  }
};

export const addUserMessage = async (from, to, text, image, audioUrl, fanpageId, type) => {
  try {
    let chat = await Chat.findOne({ username: from });

    if (!chat) {
      chat = new Chat({ username: from, client: to, messages: [], fanpageId, type });
    }

    chat. messages.push({ from: 'user', to: 'client', text, image, audioUrl });

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
      chat = new Chat({ username: to, client: from, messages: [] });
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

export const getMessagesForUser = async (user, limit) => {
  let chat;
  try {
    if (limit) {
      chat = await Chat.findOne({ username: user }, { messages: { $slice: -10 } });
    } else {
      chat = await Chat.findOne({ username: user });
    }

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
    // const chat = await Chat.findOne({ username: client });
    const chat = await Chat.findOne({ username: client }, { messages: { $slice: -100 }});
    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getChatForUserByClient = async client => {
  try {
    const chat = await Chat.findOne({ client });
    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getChatByNickName = async nickname => {
  try {
    const chat = await Chat.findOne({ nickname });
    return chat;
  } catch (error) {
    throw new Error('Error retrieving messages: ' + error.message);
  }
}

export const getUsersList = async (email) => {
  try {
    const chats = await Chat.find(
      { client: email, status: 'active' },
      { messages: { $slice: -1 } }
    ).sort({ updatedAt: -1 }).limit(100);;

    return chats;
  } catch (error) {
    throw new Error('Error retrieving user list: ' + error.message);
  }
};

// export const getFilteredUsersList = async (email, filter) => {
//   let chats;
//   try {
//     if (filter === 'All') {
//       chats = await Chat.find({
//         client: email,
//         status: 'active'
//       },
//         { messages: { $slice: -1 } }
//       ).sort({ updatedAt: -1 });
//     } else {
//       chats = await Chat.find({
//         client: email,
//         tags: filter,
//         status: 'active'
//       },
//         { messages: { $slice: -1 } }
//       ).sort({ updatedAt: -1 }).limit(100);;
//     }


//     return chats;
//   } catch (error) {
//     throw new Error('Error retrieving user list: ' + error.message);
//   }
// }

export const getFilteredUsersList = async (email, filter, limit = 100, offset = 0) => {
  try {
    const query = {
      client: email,
      status: 'active',
    };

    if (filter !== 'All') {
      query.tags = filter;
    }

    const totalDocuments = await Chat.countDocuments(query);

    const chats = await Chat.find(query, { messages: { $slice: -1 } })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);

    return {
      total: totalDocuments,
      chats,
    };
  } catch (error) {
    throw new Error('Error retrieving user list: ' + error.message);
  }
};

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

export const deleteChatByUser = async (username) => {
  try {
    const chat = await Chat.findOne({ username });

    if (!chat) {
      throw new Error('Chat no encontrado para este participante');
    }

    chat.status = 'inactive';

    await chat.save();

    console.log(`Chat con username ${username} marcado como inactivo.`);
  } catch (error) {
    console.error('Error al actualizar el chat:', error.message);
  }
};

export const getReportData = async (clientEmail, startDate, endDate) => {
  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const reportData = await Chat.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end
          },
          client: clientEmail,
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          chatCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return reportData.map(entry => ({
      date: entry._id,
      count: entry.chatCount
    }));
  } catch (error) {
    console.error('Error al obtener los datos del reporte:', error.message);
    throw new Error('Error al obtener los datos del reporte');
  }
};

export const calculateAverageResponseTime = async (clientId, startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  try {
    const chats = await Chat.find({
      client: clientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (chats.length === 0) {
      console.log("No hay chats en el rango de fechas seleccionado.");
      return 0;
    }

    let totalResponseTime = 0;
    let responseCount = 0;

    chats.forEach(chat => {
      const userMessage = chat.messages.find(msg => msg.from === 'user');
      const clientMessage = chat.messages.find(msg => msg.from === 'client' && msg.createdAt > userMessage?.createdAt);

      if (userMessage && clientMessage) {
        const responseTime = clientMessage.createdAt - userMessage.createdAt;
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

    const averageResponseTimeMinutes = averageResponseTime / (1000 * 60);

    return averageResponseTimeMinutes;
  } catch (error) {
    console.error('Error al calcular el tiempo de respuesta promedio:', error);
    throw new Error('Error al calcular el tiempo de respuesta promedio');
  }
};
