let selectedUser;

function editContact() {
    console.log('edit contact')
}

function backToProfile() {
    window.location.href = 'profile.html';
}

function renderChatMessage(user, message, image) {
    const chatBox = document.querySelector('.chat-box');
    const li = document.createElement('li');

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
                <span class="message-chat-box">${message}</span>`;
        }
    } else {
        li.innerHTML = `<span class="user-chat-box">${user}: </span> <span class="message-chat-box">${message}</span>`;
        li.classList.add('other-message');
    }

    chatBox.appendChild(li);
    li.scrollIntoView({ behavior: 'smooth', block: 'end' });
    renderUsers();
}

function displayMessages(filteredMessages) {
    const chatBox = document.querySelector('.chat-box');
    chatBox.innerHTML = '';
    filteredMessages.forEach(msg => {
        renderChatMessage(msg.from, msg.text, msg.image);
    });
}

async function getUserList(email) {
    try {
        let response = await fetch(`/crm/users/list/${email}`)
        let userList = await response.json();
        console.log(userList)
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
        const userElement = `
            <li class="person" data-chat="${user}">
                <div class="user">
                    <img src="${userTemplate.img}" alt="${user}">
                </div>
                <p class="name-time">
                    <span class="name">${user}</span>
                    <span class="time">${userTemplate.time}</span>
                </p>
            </li>
        `;
        usersList.innerHTML += userElement;
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

async function selectUser(email) {
    selectedUser = email;
    const usernameId = document.getElementById('username-id');
    let chatMessages = await getChatMessages(email);
    displayMessages(chatMessages);
    usernameId.innerHTML = email;
    const chatContainer = document.querySelector('.chat-container');
    const userContainer = document.querySelector('.users-container');

    if (isMobile()) {
        userContainer.style.display = 'none';
        chatContainer.style.display = 'block';
    } else {
        chatContainer.style.display = 'block';
    }
}

async function getUserEmail() {
    try {
        let response = await fetch(`/auth/data`);
        let data = await response.json();
        console.log(data.email)
        return data.email;
    } catch (error) {
        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const userEmail = await getUserEmail();
    const ws = new WebSocket(`wss://${window.location.host}?userEmail=${encodeURIComponent(userEmail)}`);

    renderUsers();

    ws.onmessage = (event) => {
        const { user, text, destination, image } = JSON.parse(event.data);
        if (destination === selectedUser) {
            renderChatMessage(user, text, image);
        }

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
            const userSpan = li.querySelector('.name');
            if (userSpan) {
                const email = userSpan.textContent.trim();
                selectUser(email);
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