const fetchOrders = async () => {
    try {
        const response = await fetch(`/draft`);
        if (!response.ok) {
            if (response.statusText === "Unauthorized") {
                window.location.href = 'login.html'
            }

            throw new Error('No se pudo obtener la lista de órdenes');
        };
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error('Error al obtener órdenes:', error.message);
        throw new Error('No se pudo obtener la lista de órdenes');
    }
};

async function approvePreOrder(orderId) {
    try {
        const response = await fetch(`/draft/approve/${orderId}`, {
            method: 'POST',
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
            title: "Se aprobó la orden correctamente",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = 'orders.html';
        });
    } catch (error) {
        console.error('Error al realizar la acción:', error);
    }
}


const renderOrders = async () => {
    const orders = await fetchOrders();
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
            const status = order.approved ? 'active' : 'inactive';
            const statusText = order.approved ? 'Aprobado' : 'Pendiente';
            const orderDate = new Date(order.updatedAt).toLocaleDateString();
            return `<tr>
                <td>${orderDate}</td>
                <td class="order-profile">
                    <span class="profile-info">
                        <span class="profile-info__name">
                            ${order.email}
                        </span>
                    </span>
                </td>
                <td>
                    <span class="status status--${status}">
                        ${statusText}
                    </span>
                </td>
                <td>${order.quantity}</td>
                ${!order.approved ? `<td>
                <button onclick="approvePreOrder('${order._id}')">
                    <img src="assets/order/approve.svg" alt="Icono" width="24" height="24" style="background-color: transparent; border: none;">
                </button>
            </td>` : ''}
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
};

function redirectToAdmin() {
    window.location.href = 'admin.html';
  }
  

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
  