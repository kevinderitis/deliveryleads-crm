
let loginForm = document.querySelector(".my-form");
let email = document.getElementById("email");
let password = document.getElementById("password");
let username = document.getElementById("name");
let confirmPassword = document.getElementById("confirm-password");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        email: email.value,
        password: password.value,
        name: username.value
    };

    try {
        const response = await fetch(`/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            Swal.fire({
                icon: "error",
                title: "Ups...",
                text: "Error al registrar el usuario",
                footer: '<a href="#"></a>'
              });
            throw new Error('Error en la solicitud al servidor');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error.message);
    }
});

function onChange() {
    if (confirmPassword.value === password.value) {
        confirmPassword.setCustomValidity('');
    } else {
        confirmPassword.setCustomValidity('Las contraseñas no son iguales');
    }
}

password.addEventListener('change', onChange);
confirmPassword.addEventListener('change', onChange);


