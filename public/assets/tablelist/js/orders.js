const fetchOrders = async () => {
    try {
        const response = await fetch(`/order`);
        if (!response.ok) {
            if (response.statusText === "Unauthorized") {
                window.location.href = 'login.html'
            }
            throw new Error('No se pudo obtener la lista de órdenes');
        }
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error('Error al obtener órdenes:', error.message);
        throw new Error('No se pudo obtener la lista de órdenes');
    }
};

const fetchClients = async () => {
    try {
        const response = await fetch('/client');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error('Failed to fetch data');
    }
};

const createOrder = async (email, quantity) => {
    try {
        const response = await fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, quantity })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Create order error:', error);
        throw new Error('Failed to create order');
    }
};

async function newOrder() {
    try {
        const clients = await fetchClients();

        const clientOptions = clients.map(client => ({
            text: `${client.name} (${client.email})`,
            value: client.email
        }));

        const result = await Swal.fire({
            title: 'Crear nueva orden',
            html: `
          <select id="swal-input-client" class="swal2-select" placeholder="Selecciona un cliente">
            ${clientOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
          </select>
          <input id="swal-input-quantity" class="swal2-input" type="number" placeholder="Ingresa la cantidad">
        `,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            focusConfirm: false,
            preConfirm: async () => {
                const email = Swal.getPopup().querySelector('#swal-input-client').value;
                const quantity = Swal.getPopup().querySelector('#swal-input-quantity').value;

                if (!email || !quantity) {
                    Swal.showValidationMessage('Por favor selecciona un cliente y ingresa la cantidad');
                    return false;
                }

                try {
                    await createOrder(email, quantity);
                    return { email, quantity };
                } catch (error) {
                    Swal.showValidationMessage(`Error al crear la orden: ${error.message}`);
                    return false;
                }
            }
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: '¡Guardado!',
                text: 'La nueva orden ha sido creada',
                icon: 'success',
                timer: 1000,
                timerProgressBar: true,
                didClose: () => {
                    window.location.reload();
                }
            });
        }
    } catch (error) {
        console.error('Error al mostrar el formulario de nueva orden:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo mostrar el formulario de nueva orden',
        });
    }
}

function redirectToAdmin() {
    window.location.href = 'admin.html';
}

function redirectToClients() {
    window.location.href = 'clients.html';
}


const renderOrders = async () => {
    const orders = await fetchOrders();
    console.log(orders)
    let tableBody = document.getElementById('order-rows');
    tableBody.innerHTML = '';

    const itemsOnPage = 10;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const start = urlParams.get('page') || 1;

    const startIndex = (start - 1) * itemsOnPage;
    const endIndex = startIndex + itemsOnPage;

    const mappedRecords = orders
        .slice(startIndex, endIndex)
        .map(order => {
            const status = order.delivered ? 'active' : 'inactive';
            let statusText = order.delivered ? 'Entregado' : 'Pendiente'
            const orderDate = new Date(order.updatedAt).toLocaleDateString();
            if (order.delivered && order.quantity > 0) {
                statusText = 'Pausado'
            }
            return `<tr>
                <td>${orderDate}</td>
                <td class="order-profile">
                    <span class="profile-info">
                        <span class="profile-info__name">
                            ${order.name}
                        </span>
                    </span>
                </td>
                <td>
                    <span class="status status--${status}">
                        ${statusText}
                    </span>
                </td>
                <td>${order.quantity}</td>
                <td></td>
                ${statusText === 'Pausado' ? `                <td>                <button onclick="activateOrder('${order.orderId}')">
                <img src="assets/order/play.svg" alt="Icono" width="24" height="24" style="background-color: transparent; border: none;">
            </button></td>` : `                <td>                <button onclick="stopOrder('${order.orderId}')">
            <img src="assets/order/stop.svg" alt="Icono" width="24" height="24" style="background-color: transparent; border: none;">
        </button></td>`}

            <td>                <button onclick="deleteOrder('${order.orderId}')">
            <img src="assets/order/delete.svg" alt="Icono" width="24" height="24" style="background-color: transparent; border: none;">
        </button></td>
            </tr>`;
        });

    tableBody.innerHTML = mappedRecords.join('');

    const pagination = document.querySelector('.pagination');
    const numberOfPages = Math.ceil(orders.length / itemsOnPage);
    const linkList = [];

    for (let i = 0; i < numberOfPages; i++) {
        const pageNumber = i + 1;
        linkList.push(`<li><a href="?page=${pageNumber}" ${pageNumber == start ? 'class="active"' : ''} title="page ${pageNumber}">${pageNumber}</a></li>`);
    }

    pagination.innerHTML = linkList.join('');

    const totalAmount = orders
        .filter(order => !order.delivered)
        .reduce((total, order) => total + order.quantity, 0);

    document.getElementById('total-amount').textContent = totalAmount;
};

document.addEventListener('DOMContentLoaded', () => {
    renderOrders();
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

async function stopOrder(orderId) {
    try {
        const response = await fetch(`/order/stop/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo completar la acción');
        }

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Se detuvo la orden correctamente",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'orders.html';
        });
    } catch (error) {
        console.error('Error al realizar la acción:', error);
    }
}

async function activateOrder(orderId) {
    try {
        const response = await fetch(`/order/activate/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo completar la acción');
        }

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Se activo la orden correctamente",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'orders.html';
        });
    } catch (error) {
        console.error('Error al realizar la acción:', error);
    }
}


async function deleteOrder(orderId) {
    try {
        const response = await fetch(`/order/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('No se pudo completar la acción');
        }

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Se elimino la orden correctamente",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'orders.html';
        });

    } catch (error) {
        console.error('Error al realizar la acción:', error);
    }
}