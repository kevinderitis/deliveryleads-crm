const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const typeParam = urlParams.get('type');

const form = document.querySelector('.order-form');

if (typeParam === 'pre') {
  let emailField = document.getElementById('email-field');
  emailField.style.display = 'none';
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('client-email').value;
  const quantity = document.getElementById('leads-quantity').value;
  
  let formData = {
    email,
    quantity
  };
  
  let url = `/order`;
  
  if (typeParam === 'pre') {
    formData = { quantity };
    url = `/draft`;
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    console.log(response)
    if (response.ok) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Se creo la orden correctamente",
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la orden",
        text: response.statusText === "Unauthorized" ? 'No estás autorizado' : response.statusText,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showCancelButton: false,
        showConfirmButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = 'login.html';
        }
      });
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error.message);
  }
});


const logout = async () => {
  try {
      const response = await fetch(`/auth/logout`);
      
      if (!response.ok) {
          throw new Error('Error al hacer logout');
      }
      
      window.location.href = 'login.html';
  } catch (error) {
      console.error('Error al hacer logout:', error.message);
  }
};
