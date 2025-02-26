let loginForm = document.querySelector(".my-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let email = document.getElementById("email");
  let password = document.getElementById("password");

  const formData = {
    email: email.value,
    password: password.value
  };

  try {
    const response = await fetch(`/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      let data = await response.json();
      let redirect = data.admin ? 'orders.html' : 'profile.html';
      window.location.href = redirect;
    } else {
      console.log('ERROR')
      Swal.fire({
        icon: "error",
        title: "Ups...",
        text: "Los datos son incorrecto",
        footer: '<a href="#"></a>'
      });
      throw new Error('Error en la solicitud al servidor');
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error.message);
  }
});
