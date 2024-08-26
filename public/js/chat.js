let selectedUser;

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

        const result = await response.json();
        console.log('Tag added successfully:', result);
        return result;

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

async function saveNickname(nickname, userId) {
    console.log(nickname, userId)
    try {
        await fetch(`/crm/nickname/${nickname}/${userId}`);

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


function addUserTag() {
    Swal.fire({
        title: 'Selecciona una etiqueta',
        html: `
            <div>
                <select id="tag-select" class="swal2-input">
                    <option value="">Selecciona una etiqueta</option>
                    <option value="Pago pendiente">Pago pendiente</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Interesado">Interesado</option>
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
                text: `Tu mensaje ha sido etiquetado como: ${tag}`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

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

function renderChatMessage(user, message, image, date) {
    const chatBox = document.querySelector('.chat-box');
    const li = document.createElement('li');
    const dateObj = new Date(date);
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes().toString().length === 1 ? `0${dateObj.getMinutes()}` : dateObj.getMinutes();
    const formattedDate = `${hours}:${minutes}`;
    if (user === selectedUser) {
        if (image) {
            li.innerHTML = `
                <div class="user-chat-box">
                    <span>${user}: </span>
                    <div class="image-container">
                        <img src="data:image/jpeg;base64,${image}" alt="">
                    </div>
                </div>`;
        } else {
            li.innerHTML = `
                <span class="user-chat-box">${user}: </span> 
                <span class="message-chat-box">${message}</span>
                <span class="message-time">${formattedDate}</span>`;
        }
    } else {
        li.innerHTML = `<span class="user-chat-box">${user}: </span> <span class="message-chat-box">${message}</span> <span class="message-time">${formattedDate}</span>`;
        li.classList.add('other-message');
    }

    chatBox.appendChild(li);
    li.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function displayMessages(filteredMessages) {
    const chatBox = document.querySelector('.chat-box');
    chatBox.innerHTML = '';
    filteredMessages.forEach(msg => {
        renderChatMessage(msg.from, msg.text, msg.image, msg.createdAt);
    });
}

function removeTagFromDOM(tagToRemove) {
    const tagSection = document.getElementById('tag-section');

    const tagElement = Array.from(tagSection.getElementsByClassName('tag'))
        .find(tag => tag.textContent.trim() === tagToRemove.trim());

    if (tagElement) {
        tagSection.removeChild(tagElement);
    }
}

function removeTagFromUser(tagToRemove) {
    let userId = getUsernameIdValue()
    removeTag(userId, tagToRemove);
    removeTagFromDOM(tagToRemove)
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


async function renderUsers() {
    const userEmail = await getUserEmail();
    let list = await getUserList(userEmail);
    const usersList = document.querySelector('.users');
    usersList.innerHTML = '';

    let userTemplate = {
        time: "15/02/2019",
        status: "busy",
        img: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk"
    };

    list.forEach(user => {
        let userName = user.nickname ? user.nickname : user.participants[0];
        let lastMessage = user.messages.slice(-1)[0];
        let preview = lastMessage.text;

        let to = lastMessage.to === user.participants[0] ? 'Tú: ' : '';

        const userElement = `
            <li class="person" data-chat="${user.participants[0]}">
                <div class="user">
                    <img src="${userTemplate.img}" alt="${userName}">
                </div>
                <p class="name-time">
                    <span class="name">${userName}</span>
                    <span class="preview">${to}${preview}</span>
                </p>
            </li>
        `;
        usersList.innerHTML += userElement;
    });
    applySelectedStyle(selectedUser);
    applyUnreadStyles();
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

async function getChatMessages(email) {
    try {
        let messages = await fetch(`/crm/chats/${email}`);
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

async function selectUser(email, nickName) {
    selectedUser = email;
    const usernameId = document.getElementById('username-id');
    const nicknameId = document.getElementById('nickname-id');
    let chat = await getChatMessages(email);
    console.log(chat)
    renderTags(chat.tags);
    displayMessages(chat.messages);
    markChatAsUnread(email);
    usernameId.innerHTML = email;

    if (nickName !== email) {
        nicknameId.innerHTML = nickName;
    } else {
        nicknameId.innerHTML = '';
    }

    const chatContainer = document.querySelector('.chat-container');
    const userContainer = document.querySelector('.users-container');

    if (isMobile()) {
        userContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    } else {
        chatContainer.style.display = 'block';
    }
    renderUsers();
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

function swalNotification(senderName, messageContent) {
    Swal.fire({
        title: `Mensaje de ${senderName}`,
        text: messageContent,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const userEmail = await getUserEmail();
    const ws = new WebSocket(`ws://${window.location.host}?userEmail=${encodeURIComponent(userEmail)}`);

    renderUsers();

    ws.onmessage = (event) => {
        const { user, text, destination, image } = JSON.parse(event.data);
        swalNotification(destination, text);
        if (destination === selectedUser) {
            renderChatMessage(user, text, image);
        } else {
            markChatAsRead(destination);
            applyUnreadStyles();
        }
        renderUsers();
    };


    function sendMessage() {
        const input = document.querySelector('#message');
        if (input.value.trim()) {
            const message = JSON.stringify({ userEmail, text: input.value, selectedUser });
            ws.send(message);
            renderChatMessage(userEmail, input.value);
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
                selectUser(chatValue, nickname);
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