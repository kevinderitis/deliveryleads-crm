const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const statusParam = urlParams.get('status');

const leads = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        isSent: true
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543210',
        isSent: false
    },
    {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '5556667777',
        isSent: true
    },
    {
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '9998887777',
        isSent: false
    },
    {
        name: 'David Brown',
        email: 'david@example.com',
        phone: '1112223333',
        isSent: true
    },
    {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '4445556666',
        isSent: false
    },
];

let tableRowCount = document.getElementsByClassName('table-row-count');
tableRowCount[0].innerHTML = `(${leads.length}) Leads`;

let tableBody = document.getElementById('lead-rows');

const itemsOnPage = 5;

const numberOfPages = Math.ceil(leads.length / itemsOnPage);

const start = (new URLSearchParams(window.location.search)).get('page') || 1;

const mappedRecords = leads
    .filter((lead, i) =>
        (((start - 1) * itemsOnPage) < i + 1) &&
        (i+1 <= start * itemsOnPage)
    )
    .map(
        (lead) => {
            return `<tr>
        <td>${lead.name}</td>
        <td>${lead.email}</td>
        <td>${lead.phone}</td>
        <td>
            <span class="status status--${lead.isSent ? 'active' : 'inactive'}">
                ${lead.isSent ? 'Sent' : 'Not Sent'}
            </span>
        </td>
    </tr>`;
        });

tableBody.innerHTML = mappedRecords.join('');

const pagination = document.querySelector('.pagination');

const linkList = [];

for (let i = 0; i < numberOfPages; i++) {
    const pageNumber = i + 1;

    linkList.push(`<li><a href="?page=${pageNumber}" ${pageNumber == start ? 'class="active"' : ''} title="page ${pageNumber}">${pageNumber}</a></li>`);
}

pagination.innerHTML = linkList.join('');
