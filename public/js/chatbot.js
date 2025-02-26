let ws;

async function getUserEmail() {
  try {
    let response = await fetch(`/auth/lead/data`);
    let data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}


// function showNotification() {
//   navigator.serviceWorker.ready.then(function (registration) {
//       registration.showNotification(`Mensaje de Carla`, {
//           body: 'Nuevo mensaje.',
//           icon: '../images/beneficios.png',
//           actions: [
//               { action: 'open', title: 'Abrir' },
//               { action: 'close', title: 'Cerrar' }
//           ]
//       });
//   });
// }

// function requestNotificationPermissionAndShow() {
//   if ('Notification' in window) {
//       if (Notification.permission === 'granted') {
//           showNotification();
//       } else if (Notification.permission === 'default') {
//           Notification.requestPermission().then((permission) => {
//               if (permission === 'granted') {
//                   showNotification();
//               } else {
//                   console.error('Permiso de notificación no concedido.');
//               }
//           }).catch((error) => {
//               console.error('Error solicitando permiso de notificación:', error);
//           });
//       } else {
//           console.error('Permiso de notificación denegado.');
//       }
//   } else {
//       console.error('Las notificaciones no están soportadas en este navegador.');
//   }
// }

function requestNotificationPermissionAndSend(user) {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      console.log('Permiso de notificación ya concedido.');
      sendServicesNotification(user)
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permiso de notificación concedido.');
          subscribeUser();
          sendServicesNotification(user)
        } else {
          console.error('Permiso de notificación no concedido.');
        }
      }).catch(error => {
        console.error('Error solicitando permiso de notificación:', error);
      });
    } else {
      console.error('Permiso de notificación denegado.');
    }
  } else {
    console.error('Las notificaciones no son soportadas en este navegador.');
  }
}


function sendServicesNotification(user) {
  const payload = JSON.stringify({
    title: '¡Nuevo mensaje!',
    body: 'Tienes un nuevo mensaje.',
    icon: '/icon.png',
  });

  fetch('/crm/subscription/send', {
    method: 'POST',
    body: JSON.stringify({ user, payload }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => console.log('Notificación enviada:', data))
    .catch(error => console.error('Error al enviar la notificación:', error));
}

async function stablishWsConnection() {
  let userData = await getUserEmail();
  if (userData.email) {
    ws = new WebSocket(`wss://${window.location.host}?userEmail=${encodeURIComponent(userData.email)}`);

    let messages = userData.chat ? userData.chat.messages : [];

    renderMessages(messages, userData.email);
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');

    subscribeUser();

    ws.onmessage = (event) => {
      const { user, text, textMessage } = JSON.parse(event.data);
      let content = text ? text : textMessage;
      generate_message(content, 'user')

      if (document.hidden) {
        console.log('La página está oculta. Enviando notificación...');
        requestNotificationPermissionAndSend(userData.email);
      } else {
        console.log('La página está visible. No se envía la notificación.');
      }

    };
  } else {
    console.log('not logued')
  }

}

function sendMessage(msg) {
  const message = JSON.stringify({ text: msg, type: 'lead' });
  if (ws) {
    ws.send(message);
  } else {
    generate_message("Hola! Para hablar con tu cajero por favor presiona jugar e ingresa con tu usuario y contraseña. Si no tenes uno presiona jugar y luego 'Quiero mi usuario' para empezar a jugar. Mucha suerte", 'user')
  }

}

var INDEX = 0;

function sendInitialMessage(user) {
  const initialMessage = `Hola ${user}, mi nombre es Lorena y estoy acá para ayudarte. El casino es https://casinohades.net Recordá que solo por HOY con tu carga de 5000 tenes 2000 de regalo!! 🎁 ¿Cuanto te gustaria cargar?`;
  generate_message(initialMessage, 'user');
}

$("#chat-submit").click(async function (e) {
  e.preventDefault();
  var msg = $("#chat-input").val();
  if (msg.trim() == '') {
    return false;
  }
  generate_message(msg, 'self');
  await sendMessage(msg);

})

function generate_message(msg, type) {
  INDEX++;
  var str = "";

  var imgSrc = (type === 'user')
    ? "images/carla.jpeg"
    : "https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png";
 
  str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
  str += "          <span class=\"msg-avatar\">";
  str += "            <img src=\"" + imgSrc + "\">";
  str += "          <\/span>";
  str += "          <div class=\"cm-msg-text\">";
  str += msg;
  str += "          <\/div>";
  str += "        <\/div>";
  $(".chat-logs").append(str);
  $("#cm-msg-" + INDEX).hide().fadeIn(300);
  if (type == 'self') {
    $("#chat-input").val('');
  }
  $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
}

function generate_button_message(msg, buttons) {
  /* Buttons should be object array 
    [
      {
        name: 'Existing User',
        value: 'existing'
      },
      {
        name: 'New User',
        value: 'new'
      }
    ]
  */
  INDEX++;
  var btn_obj = buttons.map(function (button) {
    return "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\"" + button.value + "\">" + button.name + "<\/a><\/li>";
  }).join('');
  var str = "";
  str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg user\">";
  str += "          <span class=\"msg-avatar\">";
  str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
  str += "          <\/span>";
  str += "          <div class=\"cm-msg-text\">";
  str += msg;
  str += "          <\/div>";
  str += "          <div class=\"cm-msg-button\">";
  str += "            <ul>";
  str += btn_obj;
  str += "            <\/ul>";
  str += "          <\/div>";
  str += "        <\/div>";
  $(".chat-logs").append(str);
  $("#cm-msg-" + INDEX).hide().fadeIn(300);
  $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  $("#chat-input").attr("disabled", true);
}

$(document).delegate(".chat-btn", "click", function () {
  var value = $(this).attr("chat-value");
  var name = $(this).html();
  $("#chat-input").attr("disabled", false);
  generate_message(name, 'self');
})

// $("#chat-circle").click(function() {    
//   $("#chat-circle").toggle('scale');
//   $(".chat-box").toggle('scale');
// })
$("#chat-circle, #btn1-bot").click(function (event) {
  event.preventDefault();
  $("#chat-circle").toggle('scale');
  $(".chat-box").toggle('scale');
});

$("#btn-mas-info").click(function (event) {
  event.preventDefault();
  $("#chat-circle").toggle('scale');
  $(".chat-box").toggle('scale');
  $("#chat-input").val("Quisiera saber mas sobre Koderix");
});


$(".chat-box-toggle").click(function () {
  $("#chat-circle").toggle('scale');
  $(".chat-box").toggle('scale');
})



// Rain container added
const rainContainer = document.getElementById('rain-container');

function createBill() {
  const bill = document.createElement('img');
  bill.src = './images/billete.png';
  bill.classList.add('bill');

  bill.style.left = Math.random() * 100 + 'vw';
  bill.style.animationDuration = Math.random() * 3 + 2 + 's';
  bill.style.opacity = Math.random() * 0.7 + 0.3;

  rainContainer.appendChild(bill);

  setTimeout(() => {
    bill.remove();
  }, 5000);
}

setInterval(createBill, 800);

var modal = document.getElementById("myModal");

var playButton = document.getElementById("btn1-play");

var closeBtn = document.getElementsByClassName("close")[0];

var existingUserBtn = document.getElementById("existingUser");
var newUserBtn = document.getElementById("newUser");

var existingUserForm = document.getElementById("existing-user-form");
var newUserForm = document.getElementById("new-user-form");

var modalText = document.getElementById("modal-text");

var actionButtons = document.querySelectorAll(".modal-button");

playButton.addEventListener("click", function (event) {
  event.preventDefault();
  modal.style.display = "block";
  existingUserForm.style.display = "none";
  newUserForm.style.display = "none";
  modalText.textContent = "¡Te llevamos directo a ganar!";
  actionButtons.forEach(button => button.style.display = "block");
});

existingUserBtn.addEventListener("click", function () {
  modalText.textContent = "Ingrese su usuario y contraseña:";
  existingUserForm.style.display = "block";
  newUserForm.style.display = "none";
  actionButtons.forEach(button => button.style.display = "none");
});

newUserBtn.addEventListener("click", function () {
  modalText.textContent = "Elegí tu nombre de usuario:";
  existingUserForm.style.display = "none";
  newUserForm.style.display = "block";
  actionButtons.forEach(button => button.style.display = "none");
});

closeBtn.addEventListener("click", function () {
  modal.style.display = "none";
  actionButtons.forEach(button => button.style.display = "block");
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    actionButtons.forEach(button => button.style.display = "block");
  }
});

// document.getElementById("submit-existing-user").addEventListener("click", function () {
//   var username = document.getElementById("existing-username").value;
//   var password = document.getElementById("existing-password").value;
//   alert(`Usuario: ${username}\nContraseña: ${password}`);
//   modal.style.display = "none";
//   actionButtons.forEach(button => button.style.display = "block");
// });


document.getElementById('submit-new-user').addEventListener('click', async function (event) {
  event.preventDefault();

  const username = document.getElementById('new-username').value.replace(/\s+/g, '');
  // const phone = document.getElementById('new-phone').value;
  const email = document.getElementById('new-email').value;
  const phoneError = document.getElementById('email-error');
  // const phoneError = document.getElementById('phone-error');

  phoneError.style.display = 'none';
  phoneError.textContent = '';

  if (username === '' || email === '') {
    phoneError.textContent = 'Por favor, complete ambos campos.';
    phoneError.style.display = 'block';
    return;
  }

  // const phoneRegex = /^[0-9]+$/;
  // if (!phoneRegex.test(phone)) {
  //   phoneError.textContent = 'Por favor, ingrese un número de teléfono válido (solo dígitos).';
  //   phoneError.style.display = 'block';
  //   return;
  // }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    phoneError.textContent = 'Por favor, ingrese un correo electrónico válido.';
    phoneError.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/auth/lead/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        // phone,
        email
      })
    });

    const data = await response.json();

    if (data.success) {
      var modal = document.getElementById("myModal");
      modal.style.display = "none";

      stablishWsConnection();
      onUserRegistration();
      // sendInitialMessage(username);
    } else {
      phoneError.textContent = data.msg;
      phoneError.style.display = 'block';
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    phoneError.textContent = 'Hubo un problema con el registro. Inténtelo de nuevo más tarde.';
    phoneError.style.display = 'block';
  }
});

function renderMessages(messages, user) {
  messages.forEach(element => {
    let name = element.from === 'user' ? 'self' : 'user'
    generate_message(element.text, name);
  });
}

document.getElementById("submit-existing-user").addEventListener("click", async function (event) {
  event.preventDefault();

  const username = document.getElementById("existing-username").value;
  const password = document.getElementById("existing-password").value;
  const loginError = document.getElementById('login-error');

  loginError.style.display = 'none';
  loginError.textContent = '';

  if (username === '' || password === '') {
    loginError.textContent = 'Por favor, complete ambos campos.';
    loginError.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/auth/lead/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      const modal = document.getElementById("myModal");
      modal.style.display = "none";

      stablishWsConnection();
    } else {
      loginError.textContent = data.msg;
      loginError.style.display = 'block';
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    loginError.textContent = 'Hubo un problema con el inicio de sesión. Inténtelo de nuevo más tarde.';
    loginError.style.display = 'block';
  }
});

function isSocialMediaBrowser() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return (userAgent.includes("Instagram") || userAgent.includes("FBAN") || userAgent.includes("FBAV"));
}


document.addEventListener('DOMContentLoaded', (event) => {
  const targetUrl = "gana-online.online";
  const chromeLink = "googlechrome://" + targetUrl;

  if (isSocialMediaBrowser()) {

    const url = "intent://gana-online.online#Intent;scheme=https;end";

    window.location.href = url;

    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.href = chromeLink;
      }
    }, 1000);
  }

  stablishWsConnection();
});

function onUserRegistration() {
  console.log("Usuario registrado. Enviando evento a Facebook Pixel.");
  fbq('track', 'CompleteRegistration');
}

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/services-worker.js', { scope: '/' })
//       .then(function (registration) {
//           console.log('Service Worker registrado con éxito:', registration);
//       }).catch(function (error) {
//           console.log('Fallo en el registro del Service Worker:', error);
//       });
// }

const publicVapidKey = 'BLH1jhlZ9PhH04dr2O-CbvxunSvRX59mLg82xlYiu7Ur1KFKr1NriVrIXYSpDGLQEAuZp9yKCPhbkiZdxIrL8LA';

// if ('serviceWorker' in navigator) {
//   subscribeUser().catch(err => console.error(err));
// }

async function subscribeUser() {
  const register = await navigator.serviceWorker.register('/services-worker.js', {
    scope: '/'
  });

  const userData = await getUserEmail();
  const user = userData.email;

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  await fetch('/crm/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription, user }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log('Suscripción enviada al servidor.');

}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getWhatsappConfig() {
  try {
    let response = await fetch('/crm/whatsapp');
    let data = await response.json();
    return data.whatsapp;
  } catch (error) {
    console.log(error);
  }
}


async function openWhatsappLink() {
  let whatsappNumber = await getWhatsappConfig();
  let url = 'https://wa.me/' + whatsappNumber;
  window.open(url, '_blank');
}

function openCasinoLink() {
  let url = 'https://vudu8.bet/';
  window.open(url, '_blank');
}


// Listener para el botón de enviar imagen
document.getElementById('chat-send-image').addEventListener('click', function() {
  document.getElementById('chat-image-input').click();
});

// Listener para el input file (cuando se seleccione la imagen)
document.getElementById('chat-image-input').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result; // Esto es un Data URL en base64
    // Envía la imagen a través del WebSocket o la función que uses para enviar mensajes
    sendImageMessage(imageData);
    // Opcional: muestra la imagen en el chat (tipo 'self')
    generate_image_message(imageData, 'self');
  };
  reader.readAsDataURL(file);
});

// Función para enviar imagen por WebSocket
function sendImageMessage(imageData) {
  const message = JSON.stringify({ image: imageData, type: 'lead', text: 'Imagen enviada' });
  if (ws) {
    ws.send(message);
  } else {
    generate_image_message(imageData, 'user');
  }
}

// Función para renderizar el mensaje de imagen en el chat
function generate_image_message(imageData, type) {
  INDEX++;
  // Define la imagen de avatar según el tipo
  var imgSrc = (type === 'user')
    ? "images/carla.jpeg"
    : "https://cdn1.iconfinder.com/data/icons/user-pictures/100/male3-512.png";
  
  let str = "";
  str += "<div id='cm-msg-" + INDEX + "' class='chat-msg " + type + "'>";
  str += "  <span class='msg-avatar'>";
  str += "    <img src='" + imgSrc + "'>";
  str += "  </span>";
  str += "  <div class='cm-msg-text'>";
  // Inserta la imagen en el mensaje
  str += "    <img src='" + imageData + "' alt='Imagen enviada' style='max-width: 200px; border-radius: 8px;'/>";
  str += "  </div>";
  str += "</div>";
  
  $(".chat-logs").append(str);
  $("#cm-msg-" + INDEX).hide().fadeIn(300);
  $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
}