let selectedUser;
let selectedUserType;
let selectedTag;
let selectedPage;

function openEmojiPicker() {
    const emojiPicker = new EmojiMart.Picker({
        onEmojiSelect: (emoji) => insertEmoji(emoji.native),
    });

    emojiPicker.render(document.body);
}

function markChatAsRead(chatValue) {
    let unreadChats = JSON.parse(localStorage.getItem('unreadChats')) || [];

    if (!unreadChats.includes(chatValue)) {
        unreadChats.push(chatValue);
        localStorage.setItem('unreadChats', JSON.stringify(unreadChats));
    }
};

function markChatAsUnread(chatValue) {
    let unreadChats = JSON.parse(localStorage.getItem('unreadChats')) || [];

    unreadChats = unreadChats.filter(chat => chat !== chatValue);
    localStorage.setItem('unreadChats', JSON.stringify(unreadChats));
};

function applyUnreadStyles() {
    const unreadChats = JSON.parse(localStorage.getItem('unreadChats')) || [];
    unreadChats.forEach(chatValue => {
        const listItem = document.querySelector(`li[data-chat="${chatValue}"]`);
        if (listItem) {
            listItem.style.backgroundColor = '#d93d3da0';
        }


    });
};

function applyReadStyles(chatValue) {
    const listItem = document.querySelector(`li[data-chat="${chatValue}"]`);
    if (listItem) {
        listItem.style.backgroundColor = '#1a1a1a';
    }
};


function applySelectedStyle(chatValue) {
    const previouslySelected = document.querySelector('li.person.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    const listItem = document.querySelector(`li[data-chat="${chatValue}"]`);
    if (listItem) {
        listItem.classList.add('selected');
    }
}

const getUsernameIdValue = () => {
    const usernameElement = document.getElementById('username-id');
    return usernameElement.textContent || usernameElement.innerText;
};

const addTag = async (id, tag) => {
    try {
        const response = await fetch(`/crm/tags/add/${id}/${tag}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error adding tag:', error);
        throw error;
    }
};

const removeTag = async (id, tag) => {
    try {
        const response = await fetch(`/crm/tags/remove/${id}/${tag}`);
    } catch (error) {
        console.error('Error adding tag:', error);
        throw error;
    }
};

async function saveNickname(nickname, userId, password) {
    let url = password ? `/crm/nickname/${nickname}/${userId}/${password}` : `/crm/nickname/${nickname}/${userId}`;
    try {
        await fetch(url);
        console.log('Nickname guardado exitosamente');

        Swal.fire({
            title: 'Nickname guardado',
            text: `Tu nickname "${nickname}" ha sido guardado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'OK'
        });

    } catch (error) {
        console.error('Error al guardar el nickname:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al guardar tu nickname. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

async function createUser() {
    let userChat = await getChatMessages(selectedUser, 1);
    let inputMessage = document.getElementById('message');
    if (userChat.nickname) {
        Swal.fire({
            title: 'Credenciales',
            html: `
                <div>
                    <p><strong>Usuario:</strong> <span id="username">${userChat.nickname}</span></p>
                </div>
                <div style="margin-top: 10px;">
                    <p><strong>Contraseña:</strong> <span id="password">${userChat.password}</span></p>
                </div>
                <div style="margin-top: 10px;">
                    <p><strong>Whatsapp:</strong> <span id="phone">${userChat.phone}</span></p>
                </div>
                <div style="margin-top: 10px;">
                    <p><strong>Email:</strong> <span id="email">${userChat.email}</span></p>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'Aceptar'
        }).then((result) => {
            if (result.isConfirmed) {
                inputMessage.value = `https://vudu.bet/ Usuario: ${userChat.nickname} -> Contraseña: ${userChat.password}`;;
            }
        });
    } else {
        Swal.fire({
            title: 'Ingresa usuario y contraseña',
            html:
                '<input id="swal-input-username" class="swal2-input" placeholder="Usuario">' +
                '<input id="swal-input-password" type="password" class="swal2-input" placeholder="Contraseña">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const username = document.getElementById('swal-input-username').value;
                const password = document.getElementById('swal-input-password').value;
                if (!username || !password) {
                    Swal.showValidationMessage('Ambos campos son obligatorios');
                    return false;
                }
                if (username.length < 3) {
                    Swal.showValidationMessage('El nombre de usuario debe tener al menos 3 caracteres');
                    return false;
                }
                return { username, password };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { username, password } = result.value;
                let userId = getUsernameIdValue();
                saveNickname(username, userId, password);
                inputMessage.value = `Usuario: ${username} -> Contraseña: ${password}`;;
            }
        });
    }

}

async function savePhone(phone, userId) {
    try {
        await fetch(`/crm/phone/${phone}/${userId}`, {
            method: 'GET'
        });

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Número de teléfono guardado correctamente'
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al guardar el número de teléfono'
        });
    }
}

async function savePhoneNumber() {
    Swal.fire({
        title: 'Ingresa el número de teléfono',
        html: '<input id="swal-input-phone" class="swal2-input" placeholder="Número de teléfono">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const phone = document.getElementById('swal-input-phone').value;
            if (!phone) {
                Swal.showValidationMessage('El número de teléfono es obligatorio');
                return false;
            }
            if (!/^\d+$/.test(phone)) {
                Swal.showValidationMessage('El número de teléfono debe contener solo dígitos');
                return false;
            }
            if (phone.length < 7) {
                Swal.showValidationMessage('El número de teléfono debe tener al menos 7 dígitos');
                return false;
            }
            return phone;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const phone = result.value;
            let userId = getUsernameIdValue();
            savePhone(phone, userId);
        }
    });
}

async function changeWhatsappNumber(phone) {
    try {
        await fetch(`/crm/whatsapp/${phone}`, {
            method: 'GET'
        });

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Número de teléfono guardado correctamente'
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al guardar el número de teléfono'
        });
    }
}

async function changeWhatsapp() {
    Swal.fire({
        title: 'Ingresa el número de teléfono',
        html: '<input id="swal-input-phone" class="swal2-input" placeholder="Número de teléfono">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const phone = document.getElementById('swal-input-phone').value;
            if (!phone) {
                Swal.showValidationMessage('El número de teléfono es obligatorio');
                return false;
            }
            if (!/^\d+$/.test(phone)) {
                Swal.showValidationMessage('El número de teléfono debe contener solo dígitos');
                return false;
            }
            if (phone.length < 7) {
                Swal.showValidationMessage('El número de teléfono debe tener al menos 7 dígitos');
                return false;
            }
            return phone;
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const phone = result.value;
            await changeWhatsappNumber(phone);
        }
    });
}

async function saveEmailToUser(email, userId) {
    try {
        const response = await fetch(`/crm/email/${email}/${userId}`, {
            method: 'GET'
        });

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Correo electrónico guardado correctamente'
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al guardar el correo electrónico'
        });
    }
}

async function saveUserEmail() {
    Swal.fire({
        title: 'Ingresa el correo electrónico',
        html: '<input id="swal-input-email" class="swal2-input" placeholder="Correo electrónico">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const email = document.getElementById('swal-input-email').value;
            if (!email) {
                Swal.showValidationMessage('El correo electrónico es obligatorio');
                return false;
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                Swal.showValidationMessage('El correo electrónico no es válido');
                return false;
            }
            return email;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const email = result.value;
            let userId = getUsernameIdValue();
            saveEmailToUser(email, userId);
        }
    });
}

function editContact() {
    Swal.fire({
        title: 'Ingresa tu nickname',
        input: 'text',
        inputPlaceholder: 'Tu nickname',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'El nickname es obligatorio';
            }
            if (value.length < 3) {
                return 'El nickname debe tener al menos 3 caracteres';
            }
            return null;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const nickname = result.value;
            const userId = getUsernameIdValue();
            saveNickname(nickname, userId);
        }
    });
}

async function deleteChat(userId) {
    let url = `/crm/delete/chat/${userId}`;
    try {
        await fetch(url, { method: 'DELETE' });
        console.log('Chat eliminado exitosamente');

        Swal.fire({
            title: 'Chat eliminado',
            text: `El chat de "${userId}" ha sido eliminado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'OK'
        });

    } catch (error) {
        console.error('Error al eliminar el chat:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al eliminar el chat. Por favor, intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

async function confirmDeleteChat() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el chat de forma definitiva. No podrás recuperarlo después.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        focusCancel: true
    }).then((result) => {
        if (result.isConfirmed) {
            let userId = getUsernameIdValue();
            deleteChat(userId);
        }
        renderUsers();
    });
}

function addUserTag() {
    Swal.fire({
        title: 'Selecciona una etiqueta',
        html: `
            <div>
                <select id="tag-select" class="swal2-input">
                    <option value="">Selecciona una etiqueta</option>
                    <option value="Pendiente">Pago pendiente</option>
                    <option value="Bronce">Bronce</option>
                    <option value="Plata">Plata</option>
                    <option value="Oro">Oro</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Retiro">Retiro</option>
                </select>
            </div>
            <div>
                <input type="text" id="custom-tag" class="swal2-input" placeholder="O crea una etiqueta personalizada">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        preConfirm: () => {
            const selectedTag = document.getElementById('tag-select').value;
            const customTag = document.getElementById('custom-tag').value.trim();

            if (!selectedTag && !customTag) {
                Swal.showValidationMessage('Por favor, selecciona una etiqueta o crea una personalizada');
                return false;
            }

            return selectedTag || customTag;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const tag = result.value;
            const userId = getUsernameIdValue();
            addTag(userId, tag);
            console.log('Etiqueta seleccionada o creada:', tag);

            Swal.fire({
                title: 'Etiqueta agregada',
                text: `El cliente ha sido etiquetado como: ${tag}`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(result => selectUser(userId, ''));

        }
    });
}

async function createPayment(amount, userId) {
    try {
        await fetch(`/crm/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, userId })
        });

        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Pago enviado correctamente'
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al enviar el pago'
        });
    }
}

async function createNewPayment() {
    Swal.fire({
        title: 'Ingresa el monto del pago',
        html: '<input id="swal-input-amount" type="number" class="swal2-input" placeholder="Monto del pago">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar Pago',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const amount = parseFloat(document.getElementById('swal-input-amount').value);
            if (isNaN(amount) || amount <= 0) {
                Swal.showValidationMessage('El monto debe ser un número positivo');
                return false;
            }
            return amount;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const amount = result.value;
            let userId = getUsernameIdValue();
            createPayment(amount, userId);
        }
    });
}

function backToProfile() {
    window.location.href = 'profile.html';
}

function addInactiveNotification(chatValue) {
    const listItem = document.querySelector(`li[data-chat="${chatValue}"]`);

    if (listItem) {
        listItem.style.backgroundColor = 'green';
    } else {
        console.error(`No se encontró ningún li con data-chat="${chatValue}"`);
    }
}

function renderChatMessage(user, message, image, audioUrl, date) {
    const chatBox = document.querySelector('.chat-box');
    const li = document.createElement('li');
    const dateObj = new Date(date);
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes().toString().length === 1 ? `0${dateObj.getMinutes()}` : dateObj.getMinutes();
    const formattedDate = `${hours}:${minutes}`;

    function makeLinksClickable(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        const urlPattern = /(http[s]?:\/\/[^\s]+)/g;
        return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
    }

    const formattedMessage = makeLinksClickable(message);

    if (user === 'user') {
        if (image) {
            li.innerHTML = `
                <div class="user-chat-box">
                    <span>${selectedUser}: </span>
                    <div class="image-container">
                        <img src="${image}">
                    </div>
                </div>`;
        } else if (audioUrl) {
            li.innerHTML = `
                <div class="user-chat-box">
                    <span>${selectedUser}: </span>
                    <div class="audio-container">
                        <audio controls>
                            <source src="${audioUrl}" type="audio/mp3">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>`;
        } else {
            li.innerHTML = `
                <span class="user-chat-box">${selectedUser}: </span> 
                <span class="message-chat-box">${formattedMessage}</span>
                <span class="message-time">${formattedDate}</span>`;
        }
    } else {
        li.innerHTML = `<span class="user-chat-box">Tú: </span> 
                        <span class="message-chat-box">${formattedMessage}</span> 
                        <span class="message-time">${formattedDate}</span>`;
        li.classList.add('other-message');
    }

    chatBox.appendChild(li);
    li.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function displayMessages(filteredMessages) {
    const chatBox = document.querySelector('.chat-box');
    chatBox.innerHTML = '';
    filteredMessages.forEach(msg => {
        renderChatMessage(msg.from, msg.text, msg.image, msg.audioUrl, msg.createdAt);
    });
}

function removeTagFromUser(tagToRemove) {
    let userId = getUsernameIdValue()
    removeTag(userId, tagToRemove).then(result => selectUser(userId, ''));
}

function renderTags(tagsArray) {
    const tagSection = document.getElementById('tag-section');

    tagSection.innerHTML = '';

    tagsArray.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.textContent = tag;
        tagElement.classList.add('tag');

        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.classList.add('remove-btn');

        tagElement.appendChild(removeButton);

        removeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            removeTagFromUser(tag);
        });

        tagSection.appendChild(tagElement);
    });
}

function copyNumber() {
    const numberElement = document.getElementById('username-id');
    const numberText = numberElement.innerText;

    const tempInput = document.createElement('input');
    tempInput.value = numberText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Copiado',
        text: numberText,
        showConfirmButton: false,
        timer: 1500,
        toast: true
    });
}



function selectPredefinedMessage() {
    const predefinedMessages = [
        {
            title: 'Bienvenida', content: `Bienvenido! Somos LD club, más de 10 años en el rubro! 

        ¡𝐉𝐔𝐆𝐀 𝐒𝐈𝐍 𝐋𝐈𝐌𝐈𝐓𝐄𝐒, 𝑪𝑶𝑵 𝑺𝑬𝑮𝑼𝑹𝑰𝑫𝑨𝑫, 𝑷𝑹𝑰𝑽𝑨𝑪𝑰𝑫𝑨𝑫 𝒀 𝑪𝑶𝑵𝑭𝑰𝑨𝑵𝒁𝑨!
        
        𝗕𝗼𝗻𝗼 𝗱𝗲 𝗯𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱𝗮 𝗱𝗲𝗹 𝟯𝟬% 𝗱𝗲𝘀𝗱𝗲 𝟯.𝟬𝟬𝟬 𝗲𝗻 𝗹𝗮 𝗺𝗲𝗷𝗼𝗿 𝗽𝗹𝗮𝘁𝗮𝗳𝗼𝗿𝗺𝗮 𝗱𝗲𝗹 𝗺𝗲𝗿𝗰𝗮𝗱𝗼 🔥
        https://www.ghostrouter.online/vudu
        𝙋𝙚𝙙𝙞́ 𝙩𝙪 𝙪𝙨𝙪𝙖𝙧𝙞𝙤 𝙙𝙚 𝙡𝙖 𝙨𝙪𝙚𝙧𝙩𝙚 
        
        𝙋𝘼𝙂𝙊 𝙀𝙉 𝙀𝙇 𝘿𝙄́𝘼` },
        { title: 'Link', content: 'Te dejo el link de la plataforma: https://www.ghostrouter.online/vudu' },
        { title: 'Whatsapp', content: 'Te dejo mi numero de Whatsapp para que sigamos hablando por ahi! Agendame! https://www.ghostrouter.online/phone' },
        { title: 'Whatsapp2', content: 'Pasame tus datos para el premio a este numero por favor! https://www.ghostrouter.online/phone' },
        { title: 'Cronograma', content: 'LOS PREMIOS SE PAGAN EN EL DIA!' },
        { title: 'Agradecimiento', content: 'Gracias por tu compra. Esperamos verte pronto de nuevo.' }
    ];

    const htmlContent = `
        <div>
            <select id="message-select" class="swal2-input">
                <option value="">Selecciona un mensaje predefinido</option>
                ${predefinedMessages.map(msg => `<option value="${msg.content}">${msg.title}</option>`).join('')}
            </select>
        </div>
        <div>
            <textarea id="message-text" class="swal2-textarea" placeholder="El mensaje seleccionado aparecerá aquí..." readonly></textarea>
        </div>
    `;

    Swal.fire({
        title: 'Selecciona un mensaje predefinido',
        html: htmlContent,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        preConfirm: () => {
            const selectedMessage = document.getElementById('message-text').value.trim();
            if (!selectedMessage) {
                Swal.showValidationMessage('Por favor, selecciona un mensaje predefinido o modifícalo');
                return false;
            }
            return selectedMessage;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('message').value = result.value;
        }
    });

    document.addEventListener('change', function (event) {
        if (event.target && event.target.id === 'message-select') {
            const selectedContent = event.target.value;
            document.getElementById('message-text').value = selectedContent;
        }
    });
}

// function renderTags(tagsArray) {
//     const tagSection = document.getElementById('tag-section');

//     tagSection.innerHTML = '';

//     tagsArray.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.textContent = tag;
//         tagElement.classList.add('tag'); 

//         tagElement.addEventListener('click', () => {
//             console.log(`Tag clicked: ${tag}`);
//         });

//         tagSection.appendChild(tagElement);
//     });
// }

async function getUserList(email) {
    try {
        let response = await fetch(`/crm/users/list/${email}`)
        let userList = await response.json();
        return userList;
    } catch (error) {
        console.log(error);
    }
}

async function getFilteredList(email, filter, page) {
    try {
        let pageNum = page ? page : 1;
        let response = await fetch(`/crm/users/list/${email}/${filter}/${pageNum}`)
        let userList = await response.json();
        return userList;
    } catch (error) {
        console.log(error);
    }
}

async function renderUsers() {
    const userEmail = await getUserEmail();
    let list;
    let pages;
    if (!selectedTag) {
        list = await getUserList(userEmail);
    } else {
        let page = selectedPage ? selectedPage : 1;
        let users = await getFilteredList(userEmail, selectedTag, page);
        list = users.list
        pages = users.pages;
    }

    const usersList = document.querySelector('.users');
    usersList.innerHTML = '';

    // let img = "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk";
    let img = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1200px-Facebook_Messenger_logo_2020.svg.png";

    list.forEach(user => {
        let userName = user.username;
        let lastMessage = user.messages.slice(-1)[0];
        let preview = lastMessage.text ? lastMessage.text : 'media';
        let to = lastMessage.to === 'user' ? 'Tú: ' : '';
        let nickname = user.nickname ? user.nickname : userName;

        let statusColor = user.online || user.type === 'lead' ? 'green' : 'white';

        let imgFin = user.type === 'lead' ? 'https://clipart-library.com/2023/Star-Clipart-PNG.jpg' : img;

        const userElement = `
            <li class="person" data-chat="${userName}">
                <div class="user">
                    <img src="${imgFin}" alt="${userName}">
                    <span class="status-dot" style="background-color: ${statusColor};"></span>
                </div>
                <p class="name-time">
                    <span class="name">${userName}</span>
                    <span class="nickname">${nickname}</span>
                    <span class="preview">${to}${preview}</span>
                </p>
            </li>
        `;

        usersList.innerHTML += userElement;
    });

    renderPaginationControls(pages);

    applySelectedStyle(selectedUser);
    applyUnreadStyles();

    if (!selectedUser) {
        selectUser(list[0].username, list[0].username);
    }
}


function renderPaginationControls(totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    if (totalPages) {
        const prevButton = `
        <button ${selectedPage === 1 ? 'disabled' : ''} class="pagination-btn" data-page="${selectedPage - 1}">
            Anterior
        </button>
    `;

        const nextButton = `
        <button ${selectedPage === totalPages ? 'disabled' : ''} class="pagination-btn" data-page="${selectedPage + 1}">
            Siguiente
        </button>
    `;

        paginationContainer.innerHTML = prevButton + `${selectedPage} de ${totalPages} ` + nextButton;
    }


    document.querySelectorAll('.pagination-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const newPage = parseInt(e.target.dataset.page);
            if (newPage > 0 && newPage <= totalPages) {
                selectedPage = newPage;
                renderUsers();
            }
        });
    });
}

// async function renderUsers() {
//     const userEmail = await getUserEmail();
//     let list = await getUserList(userEmail);
//     const usersList = document.querySelector('.users');
//     usersList.innerHTML = '';

//     let userTemplate = {
//         time: "15/02/2019",
//         status: "busy",
//         img: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk"
//     };

//     list.forEach(user => {
//         const userElement = `
//             <li class="person" data-chat="${user}">
//                 <div class="user">
//                     <img src="${userTemplate.img}" alt="${user}">
//                 </div>
//                 <p class="name-time">
//                     <span class="name">${user}</span>
//                 </p>
//             </li>
//         `;
//         usersList.innerHTML += userElement;
//     });
//     applySelectedStyle(selectedUser);
//     applyUnreadStyles();
// }

async function startNewChat(from, text) {
    try {
        let response = await fetch('/crm/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from, text })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let result = await response.json();
        return result;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function toggleMenu() {
    const menu = document.getElementById("hamburger-menu");
    menu.classList.toggle("show");
}

function goToDashboard() {
    window.location.href = "/report.html";
}


function newChat() {
    Swal.fire({
        title: 'Nuevo Chat',
        html:
            '<input id="swal-input-number" class="swal2-input" placeholder="Número de teléfono">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const number = document.getElementById('swal-input-number').value;

            if (!number) {
                Swal.showValidationMessage('El número de teléfono es obligatorio');
                return false;
            }

            const phoneNumberPattern = /^[0-9]+$/;
            if (!phoneNumberPattern.test(number)) {
                Swal.showValidationMessage('El número de teléfono debe contener solo números');
                return false;
            }

            return { number };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const { number } = result.value;
            await startNewChat(number, 'New Contact');
        }
    });
}


async function getChatMessages(email, limit) {
    try {
        const url = limit ? `/crm/chats/${email}?limit=${limit}` : `/crm/chats/${email}`;

        let messages = await fetch(url);
        let response = await messages.json();
        return response;
    } catch (error) {
        console.log(error);
    }
}

function isMobile() {
    return window.innerWidth <= 768;
}

function alternateUserChat() {
    let chatContainer = document.querySelector('.chat-container');
    let userContainer = document.querySelector('.users-container');
    if (isMobile()) {
        userContainer.style.display = 'block';
        chatContainer.style.display = 'none';
    } else {
        chatContainer.style.display = 'none';
    }
}

async function getAllMessages() {
    let username = selectedUser;

    let chat = await getChatMessages(username);
    displayMessages(chat.messages);
}

async function selectUser(email, phone) {
    selectedUser = email; 
    const usernameId = document.getElementById('username-id');
    let chat = await getChatMessages(email, 10);

    selectedUserType = chat.type;
    
    if (chat.tags) {
        renderTags(chat.tags);
    } else {
        console.log('No tags for user');
    }

    displayMessages(chat.messages);
    markChatAsUnread(email);
    usernameId.innerHTML = phone;

    const chatContainer = document.querySelector('.chat-container');
    const userContainer = document.querySelector('.users-container');

    if (isMobile()) {
        userContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    } else {
        chatContainer.style.display = 'block';
    }


    applySelectedStyle(email)
    applyReadStyles(email)
    // renderUsers();
}

async function getUserEmail() {
    try {
        let response = await fetch(`/auth/data`);
        let data = await response.json();
        return data ? data.email : '';
    } catch (error) {
        console.log(error);
    }
}

function playSoundNotificacion() {
    const audio = new Audio('assets/sonidos/windows-notificacion.mp3');
    audio.play().catch(error => {
        console.error('Error al reproducir el sonido:', error);
    });
}

function showNotification(senderName) {
    navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification(`Mensaje de ${senderName}`, {
            body: 'Nuevo mensaje.',
            icon: '../images/beneficios.png',
            actions: [
                { action: 'open', title: 'Abrir' },
                { action: 'close', title: 'Cerrar' }
            ]
        });
    });
}

function requestNotificationPermissionAndShow(senderName) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            showNotification(senderName);
        } else if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    showNotification(senderName);
                } else {
                    console.error('Permiso de notificación no concedido.');
                }
            }).catch((error) => {
                console.error('Error solicitando permiso de notificación:', error);
            });
        } else {
            console.error('Permiso de notificación denegado.');
        }
    } else {
        console.error('Las notificaciones no están soportadas en este navegador.');
    }
}


function swalNotification(senderName, messageContent) {
    Swal.fire({
        title: `Mensaje de ${senderName}`,
        text: messageContent,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
    });

    if (document.hidden) {
        console.log('La página está oculta. Enviando notificación...');
        requestNotificationPermissionAndShow(senderName);
    } else {
        console.log('La página está visible. No se envía la notificación.');
    }


}

const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');

emojiBtn.addEventListener('click', () => {
    emojiPicker.style.display =
        emojiPicker.style.display === 'none' || emojiPicker.style.display === '' ? 'block' : 'none';
});

function addEmoji(emoji) {
    const messageInput = document.getElementById('message');
    messageInput.value += emoji;
    emojiPicker.style.display = 'none';
}

document.addEventListener('click', (event) => {
    if (!emojiPicker.contains(event.target) && event.target !== emojiBtn) {
        emojiPicker.style.display = 'none';
    }
});

function renderFilteredUsers(tag) {
    console.log(tag);
}

const dropdownButton = document.querySelector('.dropdown-button');
const dropdownContent = document.querySelector('.dropdown-content');

function toggleDropdown() {
    const isVisible = dropdownContent.style.display === 'block';
    dropdownContent.style.display = isVisible ? 'none' : 'block';
}

function handleDropdownSelection(event) {
    if (event.target.tagName === 'A') {
        const filterValue = event.target.getAttribute('data-filter');
        selectedTag = filterValue;
        selectedPage = 1;
        renderUsers();
        dropdownContent.style.display = 'none';
    }
}

dropdownButton.addEventListener('click', toggleDropdown);

dropdownContent.addEventListener('click', handleDropdownSelection);

window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropdown-button')) {
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const userEmail = await getUserEmail();
    const ws = new WebSocket(`wss://${window.location.host}?userEmail=${encodeURIComponent(userEmail)}`);

    renderUsers();

    function getCurrentDateTime() {
        const date = new Date();
        return date.toISOString();
    }


    ws.onmessage = (event) => {
        const { user, textMessage, destination, image, audioUrl } = JSON.parse(event.data);
        swalNotification(destination, textMessage);

        if (destination === selectedUser) {
            let currentDateTime = getCurrentDateTime();
            renderChatMessage('user', textMessage, image, audioUrl, currentDateTime);
        } else {
            markChatAsRead(destination);
            applyUnreadStyles();
        }
        renderUsers();
    };

    function sendMessage() {
        const input = document.querySelector('#message');
        if (input.value.trim()) {
            const message = JSON.stringify({ userEmail, text: input.value, selectedUser, type: selectedUserType });
            ws.send(message);
            let currentDateTime = getCurrentDateTime();
            renderChatMessage(userEmail, input.value, '', '', currentDateTime);
            input.value = '';
        }
    }

    document.querySelector('#send').addEventListener('click', () => {
        sendMessage();
    });

    document.querySelector('#message').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });


    document.querySelector('.users').addEventListener('click', (event) => {
        const li = event.target.closest('li.person');
        if (li) {
            const chatValue = li.getAttribute('data-chat');
            const nameSpan = li.querySelector('.name');
            const nickname = nameSpan ? nameSpan.textContent.trim() : '';
            if (chatValue) {
                selectUser(nickname, chatValue);
            }
        }
    });

    document.querySelector('#send').addEventListener('click', () => {
        const input = document.querySelector('#message');
        if (input.value.trim()) {
            sendMessage(input.value);
            input.value = '';
        }
    });

    document.getElementById('return-btn').addEventListener('click', alternateUserChat);

});

document.getElementById('user-search').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const users = document.querySelectorAll('.users .person');

    users.forEach(function (user) {
        const userName = user.querySelector('.nickname').textContent.toLowerCase();
        if (userName.includes(filter)) {
            user.style.display = '';
        } else {
            user.style.display = 'none';
        }
    });
});


function clearFilter() {
    selectedTag = undefined;
    selectedPage = 1;
    renderUsers();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/services-worker.js', { scope: '/' })
        .then(function (registration) {
            console.log('Service Worker registrado con éxito:', registration);
        }).catch(function (error) {
            console.log('Fallo en el registro del Service Worker:', error);
        });
}


document.addEventListener("click", function (event) {
    const menu = document.getElementById("hamburger-menu");
    const button = document.querySelector(".hamburger-button");

    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.classList.remove("show");
    }
});