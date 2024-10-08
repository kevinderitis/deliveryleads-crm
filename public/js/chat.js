let selectedUser;
let selectedTag;

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

function createUser() {
    let inputMessage = document.getElementById('message');
    Swal.fire({
        title: 'Ingresa tus credenciales',
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
    if (user === selectedUser) {
        if (image) {
            li.innerHTML = `
        <div class="user-chat-box">
            <span>${user}: </span>
            <div class="image-container">
                <img src="data:image/jpeg;base64,${image}" alt="">
            </div>
        </div>`;
        } else if (audioUrl) {
            li.innerHTML = `
        <div class="user-chat-box">
            <span>${user}: </span>
            <div class="audio-container">
                <audio controls>
                    <source src="audios/${audioUrl}" type="audio/mp3">
                    Your browser does not support the audio element.
                </audio>
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
        { title: 'Bienvenida', content: 'Hola, bienvenido a nuestro servicio.' },
        { title: 'Pago Pendiente', content: 'Tienes un pago pendiente. Por favor, realiza el pago lo antes posible.' },
        { title: 'Confirmación de Pedido', content: 'Tu pedido ha sido confirmado y está en camino.' },
        { title: 'Recordatorio de Cita', content: 'Este es un recordatorio de tu cita programada.' },
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

async function getFilteredList(email, filter) {
    try {
        let response = await fetch(`/crm/users/list/${email}/${filter}`)
        let userList = await response.json();
        return userList;
    } catch (error) {
        console.log(error);
    }
}


async function renderUsers() {
    const userEmail = await getUserEmail();
    let list;
    if (!selectedTag) {
        list = await getUserList(userEmail);
    } else {
        list = await getFilteredList(userEmail, selectedTag);
    }

    const usersList = document.querySelector('.users');
    usersList.innerHTML = '';


    let img = "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk";


    list.forEach(user => {
        let userName = user.nickname ? user.nickname : user.participants[0];
        let lastMessage = user.messages.slice(-1)[0];
        let preview = lastMessage.text;

        let to = lastMessage.to === user.participants[0] ? 'Tú: ' : '';

        const userElement = `
            <li class="person" data-chat="${user.participants[0]}">
                <div class="user">
                    <img src="${img}" alt="${userName}">
                </div>
                <p class="name-time">
                    <span class="name">${user.participants[0]}</span>
                    <span class="preview">${to}${preview}</span>
                </p>
            </li>
        `;
        usersList.innerHTML += userElement;
    });
    applySelectedStyle(selectedUser);
    applyUnreadStyles();

    if (!selectedUser) {
        selectUser(list[0].participants[0], list[0].nickname);
    }

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

    if (chat.tags) {
        renderTags(chat.tags);
    }else{
        console.log('No tags for user');
    }

    displayMessages(chat.messages);
    markChatAsUnread(email);
    usernameId.innerHTML = email;

    nicknameId.innerHTML = nickName;

    // if (nickName !== email) {
    //     nicknameId.innerHTML = nickName;
    // } else {
    //     nicknameId.innerHTML = '';
    // }

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
            renderChatMessage(user, textMessage, image, audioUrl, currentDateTime);
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

document.getElementById('user-search').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const users = document.querySelectorAll('.users .person');

    users.forEach(function (user) {
        const userName = user.querySelector('.name').textContent.toLowerCase();
        if (userName.includes(filter)) {
            user.style.display = '';
        } else {
            user.style.display = 'none';
        }
    });
});


function clearFilter() {
    selectedTag = undefined;
    renderUsers();
}
